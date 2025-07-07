const {Lobby, UserInLobby} = require('../models');
const { Op } = require('sequelize');

// Checks for Lobbies where every user has exited and marks them as finished
async function cleanEmptyRooms() {

    try {
        const lobbies = await Lobby.findAll({
        where: {
            status: 'inLobby',
        },
        include: [{
            model: UserInLobby,
            where: {
            status: 'exited',
            },
            required: false,
        }],
        });
    
        for (const lobby of lobbies) {
        if (lobby.UserInLobbies.length === 0) {
            await lobby.update({ status: 'finished' });
        }
        }
    } catch (error) {
        console.error('Error cleaning empty rooms:', error);
    }
    }
// Check for active users in finished rooms and mark them as exited
async function cleanOrphanUsers() {

    try {
        const lobbies = await Lobby.findAll({
            where: {
                status: 'finished',
            },
            include: [{
                model: UserInLobby,
                where: {
                    status: {
                        [Op.not]: 'exited',
                    }
                },
                required: false,
            }],
        });

        for (const lobby of lobbies) {
            if (lobby.UserInLobbies.length > 0) {
                for (const user of lobby.UserInLobbies) {
                    await user.update({ status: 'exited' });
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning orphan users:', error);
    }
}

module.exports = {
    cleanEmptyRooms,
    cleanOrphanUsers
};