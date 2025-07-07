const { Server } = require('socket.io');
const { createServer } = require('node:http');
const { UserInLobby, Lobby } = require('../models');
const { Op } = require('sequelize');
class PokeSocket {
    #socketIo;
    #server;
    #rooms;
    #statusOptions;
    #stages;
    #disconnectTimeouts;

    constructor(app) {
        this.#server = createServer(app);
        this.#socketIo = new Server(this.#server, {
            cors: {
                origin: 'https://poke-dti.netlify.app',
                //origin: 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true,
            }
        });

        this.#rooms = {};
        this.#statusOptions = ['waitingForPlayers', 'dressing', 'voting', 'finished', 'displayingResults'];
        this.#stages = {}; 
        this.#disconnectTimeouts = {};

    }

    start() {

        this.#socketIo.on('connection', (socket) => {
            console.log('a user connected');

            // eslint-disable-next-line no-unused-vars
            const { userId, username, lobbyId, userInLobbyId, isHost } = socket.handshake.auth;
            socket.data.ignoreDisconnect = false; // Default to false, will be set to true if the game stage changes

            socket.on('message', (msg) => console.log(msg));

            socket.on('joinRoom', ({ roomId, user, gameStage }) => {

                socket.join(roomId);

                if (!["waitingForPlayers", "dressing", "voting", "displayingResults"].includes(gameStage)) {
                    console.log(`Game stage ${gameStage} is not valid for room: ${roomId}`);
                    this.#socketIo.to(roomId).emit('gameStartError', { message: 'Invalid game stage.' });
                    return;
                }
                // Verificar que el lobby existe
                if (!this.#rooms[roomId]) this.#rooms[roomId] = [];

                // Check if the user is already in the room
                const existingUser = this.#rooms[roomId]?.find(u => u.userId === user.userId);
                // If the user is already in the room, clear the disconnect timeout if it exists
                if (this.#disconnectTimeouts[userId]) {
                    clearTimeout(this.#disconnectTimeouts[userId]);
                    delete this.#disconnectTimeouts[userId];
                    console.log(`User ${username} reconnected to room ${roomId}, canceling exit.`);
                }
                // If the user is not in the room, add them
                if (!existingUser) {
                    console.log(`User ${username} joined room ${roomId}.`);
                    this.#rooms[roomId].push(user);
                }

                else {
                    existingUser.status = user.status;
                }

                // Set current game stage
                this.#stages[roomId] = gameStage;
                const currentStage = this.#stages[roomId];
                console.log(`Current stage for room ${roomId} is: ${currentStage}`);
                // Update status of the user in the lobby

                this.#socketIo.to(roomId).emit('roomUsersUpdate', this.#rooms[roomId]);

                console.log(`Room ${roomId} users updated after connect:`, this.#rooms[roomId]);
                const allUsersReady = this.checkRoomReady(roomId);
                if (gameStage === 'waitingForPlayers') {
                    this.#socketIo.to(roomId).emit('readyNotice', { isRoomReady: allUsersReady });
                    console.log(allUsersReady ?
                        `Room ${roomId} is ready to start.` : `Room ${roomId} is not ready to start yet.`);
                }

                else if (currentStage === 'dressing') {
                    console.log(`Player ${socket.handshake.auth.username} joined room ${roomId} in dressing stage.`);
                    if (allUsersReady) {
                        this.#socketIo.to(roomId).emit('usersReady', { newStatus: 'voting' });
                    }
                    console.log(`Room ${roomId} is ${allUsersReady ? "" : "not"} ready for voting stage.`);
                }
                else if (currentStage === 'voting') {
                    console.log(`Player ${socket.handshake.auth.username} joined room ${roomId} in voting stage.`);
                    if (allUsersReady) {
                        console.log(`All users are ready in room ${roomId}, sending notice to display results.`);
                        this.#socketIo.to(roomId).emit('usersReady', { newStatus: 'displayingResults' });
                    }
                    console.log(`Room ${roomId} is ${allUsersReady ? "" : "not"} ready for displaying results stage.`);
                }

                else if (currentStage === 'displayingResults') {
                    console.log(`Player ${socket.handshake.auth.username} joined room ${roomId} in displaying results stage.`);
                }
                else {
                    console.log(`Player ${socket.handshake.auth.username} joined room ${roomId} in an unknown stage: ${gameStage}`);
                    this.#socketIo.to(roomId).emit('gameStartError', { message: 'Unknown game stage.' });
                }
            });

            // Lobby listeners

            socket.on('updatePokemon', ({ userInLobbyId, choosenPokemon, pokemonImage, lobbyId }) => {

                const userToUpdate = this.#rooms[lobbyId]?.find(u => u.id === userInLobbyId);
                if (userToUpdate) {
                    userToUpdate.choosenPokemon = choosenPokemon;
                    console.log(`User ${userInLobbyId} updated Pokemon to ${choosenPokemon} in room: ${lobbyId}`);
                    this.#socketIo.to(lobbyId).emit('updateCardPokemon', { userInLobbyId, choosenPokemon, pokemonImage });
                    // Check readiness of the room
                    const allUsersReady = this.checkRoomReady(lobbyId);
                    this.#socketIo.to(lobbyId).emit('readyNotice', { isRoomReady: allUsersReady });
                }


            });

            socket.on('updateRoomData', async ({ lobbyId }) => {
                console.log(`Updating room data for lobby: ${lobbyId}`);
                if (this.#rooms[lobbyId]) {
                    this.#socketIo.to(lobbyId).emit('roomDataUpdate');
                }
            });
            socket.on('kickUser', ({ roomId, userId }) => {
                console.log(`User ${userId} kicked from room: ${roomId}`);
                if (this.#rooms[roomId]) {
                    this.#rooms[roomId] = this.#rooms[roomId].filter(u => u.userId !== userId);
                    this.#socketIo.to(roomId).emit('youWereKicked', { userId, roomId });
                    this.#socketIo.to(roomId).emit('roomUsersUpdate', this.#rooms[roomId]);
                    const allUsersReady = this.checkRoomReady(roomId);
                    this.#socketIo.to(roomId).emit('readyNotice', { isRoomReady: allUsersReady });
                    console.log(allUsersReady ?
                        `Room ${roomId} is ready to start.` : `Room ${roomId} is not ready to start yet.`);
                }
            });

            socket.on('leaveRoom', ({ roomId, userInLobbyId, reason }) => {
                console.log(`User with in room ID ${userInLobbyId} left room: ${roomId}. Reason: ${reason}`);
                if (this.#rooms[roomId]) {
                    socket.data.ignoreDisconnect = true; // Prevent disconnect from removing the user from the room
                    this.#rooms[roomId] = this.#rooms[roomId].filter(u => u.id !== userInLobbyId);
                    this.#socketIo.to(roomId).emit('roomUsersUpdate', this.#rooms[roomId]);
                    console.log(`Room ${roomId} users updated:`, this.#rooms[roomId]);
                    const allUsersReady = this.checkRoomReady(roomId);
                    this.#socketIo.to(roomId).emit('readyNotice', { isRoomReady: allUsersReady });
                    console.log(allUsersReady ?
                        `Room ${roomId} is ready to start.` : `Room ${roomId} is not ready to start yet.`);

                    if (this.#rooms[roomId].length < 2 && this.#stages[roomId] === "dressing") {
                        console.log(`Room ${roomId} has less than 2 users, stopping game.`);
                        this.#socketIo.to(roomId).emit('gameStopped', { message: 'Not enough players to continue.' });
                        this.#stages[roomId] = 'waitingForPlayers';
                    }
                }

            });

            socket.on('requestStartGame', async ({ roomId }) => {
                console.log(`User requested to start game in room: ${roomId}`);
                console.log(`Current room users:`, this.#rooms[roomId].length);
                if (this.#rooms[roomId] && this.#rooms[roomId].length > 1) {
                    // Check if all users have selected their Pokemon
                    const allUsersReady = this.#rooms[roomId].every(user => user.choosenPokemon);
                    if (allUsersReady) {
                        console.log(`All users are ready in room: ${roomId}. Sending notice...`);
                        this.#socketIo.to(roomId).emit('usersConfirmed', { roomId, newStatus: 'dressing' }); // Users are ready to start the game

                    } else {
                        console.log(`Not all users are ready in room: ${roomId}. Cannot start game.`);
                        this.#socketIo.to(roomId).emit('gameStartError', { message: 'Not all users have selected their Pokemon.' });
                    }
                } else {
                    console.log(`Not enough users in room: ${roomId} to start game.`);
                    this.#socketIo.to(roomId).emit('gameStartError', { message: 'Not enough users to start the game.' });
                }
            });

            socket.on('nukeRoom', ({ roomId }) => {
                console.log(`nuking room: ${roomId}`);
                if (this.#rooms[roomId]) {
                    socket.data.ignoreDisconnect = true; // Prevent disconnect from removing the user from the room
                    
                    this.updateLobbyAsFinished(roomId).then(() => {
                        this.#socketIo.to(roomId).emit('disconnectAll', roomId);
                    });
                }
            });

            // Dress stages listeners

            socket.on('userFinishedDressing', ({ userInLobbyId, lobbyId }) => {
                console.log(`User with id ${userInLobbyId} is done dressing in room: ${lobbyId}`);
                const userToUpdate = this.#rooms[lobbyId]?.find(u => u.id === userInLobbyId);
                if (userToUpdate) {
                    userToUpdate.status = 'finishedDressing';
                    const allUsersReady = this.checkRoomReady(lobbyId);
                    console.log(`Users after update:`, this.#rooms[lobbyId]);
                    if (allUsersReady) {
                        this.#socketIo.to(lobbyId).emit('usersReady', { newStatus: "voting" });
                        console.log(`Room ${lobbyId} is ready to vote.`);
                    }
                    else {
                        console.log(`Room ${lobbyId} is not ready to vote yet.`);
                    }
                }
            });
            
            // Voting stages listeners

            socket.on('userFinishedVoting', ({ userInLobbyId, lobbyId }) => {
                console.log(`User with id ${userInLobbyId} finished voting in room: ${lobbyId}`);
                const userToUpdate = this.#rooms[lobbyId]?.find(u => u.id === userInLobbyId);
                if (userToUpdate) {
                    userToUpdate.status = 'voted';
                    const allUsersReady = this.checkRoomReady(lobbyId);
                    console.log(`Users after update:`, this.#rooms[lobbyId]);
                    if (allUsersReady) {
                        this.#socketIo.to(lobbyId).emit('usersReady', { newStatus: "displayingResults" });
                        console.log(`Room ${lobbyId} is ready to display results.`);
                    }
                    else {
                        console.log(`Room ${lobbyId} is not ready to display results yet.`);
                    }
                }
                else {
                    console.log(`User with id ${userInLobbyId} not found in room: ${lobbyId}`);
                }
            });

            socket.on('patchLobbyOk', ({ lobbyId, newStatus }) => {
                console.log(`Lobby ${lobbyId} patched successfully, status: ${newStatus}`);

                if (this.#rooms[lobbyId] && this.#statusOptions.includes(newStatus)) {
                    socket.data.ignoreDisconnect = true; // Prevent disconnect from removing the user from the room
                    this.#socketIo.to(lobbyId).emit('stageChange', { lobbyId, newStatus });
                    socket.leave(lobbyId);
                    delete this.#rooms[lobbyId];
                }
            });

            socket.on('disconnect', async (reason) => {
                console.log(`User ${socket.handshake.auth.username} disconnected: ${reason}`);
                if (socket.data.ignoreDisconnect) {
                    console.log(`Disconnect handling ignored for user ${socket.handshake.auth.username} in room ${socket.handshake.auth.lobbyId}.`);
                    return;
                }

                // Remove user from the room (room id is in socket.handshake.auth.lobbyId)

                const roomId = socket.handshake.auth.lobbyId;
                const userId = socket.handshake.auth.userId;
                const userInLobbyId = socket.handshake.auth.userInLobbyId;


                if (this.#rooms[roomId]) {

                    console.log(`User is disconnecting from room ${roomId}.`);

                    this.#disconnectTimeouts[userId] = setTimeout(async () => {
                        if (socket.handshake.auth.isHost) {
                            console.log(`Host user ${userId} disconnected, kicking all users from room ${roomId}.`);
                            await this.updateLobbyAsFinished(roomId);
                            this.#socketIo.to(roomId).emit('disconnectAll', roomId);
                            

                        }
                        else {
                            if (!userInLobbyId || !socket) return;
                            await this.updateUserAsExited(userInLobbyId, socket);
                            console.log(`User ${userInLobbyId} left the room ${roomId} due to disconnect timeout.`);
                            this.#rooms[roomId] = this.#rooms[roomId].filter(u => u.userId !== socket.handshake.auth.userId);
                            this.#socketIo.to(roomId).emit('roomUsersUpdate', this.#rooms[roomId]);
                        }
                    }, 20000);

                    // If there is less than 2 users in the room and the game is in dressing or voting stage, stop the game
                    if (this.#rooms[roomId].length < 2 && this.#stages[roomId] === "dressing") {
                        console.log(`Room ${roomId} has less than 2 users, stopping game.`);
                        this.#socketIo.to(roomId).emit('gameStopped', { message: 'Not enough players to continue.' });
                        this.#stages[roomId] = 'waitingForPlayers';
                    }

                    if (this.#rooms[roomId].length === 0) {
                        console.log(`Room ${roomId} is empty, deleting room.`);
                        socket.leave(roomId);
                        delete this.#rooms[roomId];
                    }
                }
            });

        });


        this.#server.listen(3000, () => {
            console.log(`Socket Server listening on port ${3000}`);
        });
    }

    checkRoomReady(roomId) {
        if (this.#stages[roomId] === 'waitingForPlayers') {
            return this.#rooms[roomId] && this.#rooms[roomId].length > 1 && this.#rooms[roomId].every(user => user.choosenPokemon);
        }
        else if (this.#stages[roomId] === 'dressing') {
            return this.#rooms[roomId] && this.#rooms[roomId].length > 1 && this.#rooms[roomId].every(user => user.status === 'finishedDressing');
        }
        else if (this.#stages[roomId] === 'voting') {
            return this.#rooms[roomId] && this.#rooms[roomId].length > 1 && this.#rooms[roomId].every(user => user.status === 'voted');
        }
    }
    // Update user in lobby status to 'exited' and remove from room
    async updateUserAsExited(userInLobbyId, socket) {
        if (this.#rooms[socket.handshake.auth.lobbyId]) {
            await UserInLobby.update(
                { status: 'exited' },
                {
                    where: {
                        id: userInLobbyId,
                    }
                });
        }
    }

    async updateLobbyAsFinished(lobbyId) {
        await Lobby.update(
            { status: 'finished' },
            {
                where: {
                    id: lobbyId,
                    status: {
                        [Op.not]: 'finished'
                    }
                }
            }
        );
    }
}

module.exports = PokeSocket;