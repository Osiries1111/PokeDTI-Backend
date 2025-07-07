const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { UserInLobby, Lobby } = require('../models');
const { Op } = require('sequelize');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function getToken(req){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    return token;
}

async function authenticateToken(req, res, next) {
    const token = getToken(req);
    if (!token) 
        return res.status(401).send('Token required');

    jwt.verify(token, JWT_SECRET, (err, decoded_user) => {
        if (err) 
            return res.status(403).send('Invalid or expired token');
        
        req.user = decoded_user; // Decoded user includes token payload
        req.token = token; // Store the token in the request for later use
        next();
    });
}

function getJWTScope(token) {
    var payload = jwt.verify(token, JWT_SECRET);
    return payload.scope;
}

function isRole(role) {
    return async (req, res, next) => {
        authenticateToken(req, res, async () => {
            const token = req.token;
            const scope = getJWTScope(token);
            if (scope.includes(role)){
                next();
            }
            else
                res.status(403).send(`You're not a (${role})`);
        })
    } 
}

// Authenticate for resource creation or modification
// User must be either an admin or the owner of the resource
function authenticateOwnerOrAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        const token = getToken(req);
        const scope = getJWTScope(token);
        if (scope.includes('admin') || req.user.sub === req.params.id) {
            next();
        } else {
            res.status(403).send("You don't have permission to do that");
        }
    });
}
// User must be either the same user in the lobby or an admin
// Usable in the following routes:
// PATCH /userinlobby/:id (id is the userInLobby ID)
function authSameUserInLobbyOrAdmin(req, res, next) {
    authenticateToken(req, res, async () => {
        const token = getToken(req);
        const scope = getJWTScope(token);
        const userId = req.user.sub;
        const userInLobbyId = req.params.id;
        const userInLobby = await UserInLobby.findByPk(userInLobbyId);
        if (!userInLobby) {
            return res.status(404).send("User not found in lobby");
        }

        console.log(`User in lobby ID: ${userInLobbyId}, User ID: ${userInLobby.userId}, Authenticated User ID: ${userId}`);

        // Make sure the ids are the same data type


        if (scope.includes('admin') || userInLobby.userId == userId) {
            next();
        } else {
            res.status(403).send("You don't have permission to do that");
        }
    });
}

// User must be either in the room or an admin
// Usable in the following routes:
// GET /lobbies/:id/users (id is the lobby ID)
function authenticateInRoomOrAdmin(req, res, next) {
    authenticateToken(req, res, async () => {
        const token = getToken(req);
        const scope = getJWTScope(token);
        const userId = req.user.sub;
        const userInRoom = await UserInLobby.findOne({ // If not found, user is not in the room
            where: {
                userId: userId,
                lobbyId: req.params.id,
                status: {
                    [Op.not]: 'exited' // Ensure user is not exited
                }
            }
        });

        if (scope.includes('admin') || userInRoom) {
            next();
        }
        else {
            res.status(403).send("You must be in the room or have admin privileges to access this resource");
        }
    });
}

// User must be either the host of the room, a player trying to leave the room, or an admin
// Usable in the following routes:
// PATCH /userinlobby/leave/:id (leave room or kick user from room)
function authenticateHostOrPlayerOrAdmin(req, res, next) {
    authenticateToken(req, res, async () => {
        const token = getToken(req);
        const scope = getJWTScope(token);
        const authUserId = req.user.sub;
        const userInLobbyId = req.params.id;

        const userInRoom = await UserInLobby.findByPk(userInLobbyId);
        if (!userInRoom) {
            return res.status(404).send('User not found in the lobby');
        }

        const userInLobbyUserId = userInRoom.userId;
        const room = await Lobby.findByPk(userInRoom.lobbyId);
        if (!room) {
            return res.status(404).send('Lobby not found');
        }

        const hostId = room.hostId;

        const isSameUser = authUserId == userInLobbyUserId;
        const isHost = authUserId == hostId;
        const isAdmin = scope.includes('admin');

        if (isSameUser || isHost || isAdmin) {
            next();
        }
        else {
            res.status(403).send("You don't have permission to leave or kick this user from the room");
        }
    });
}

// User must be either the host of the room or an admin
// Usable in the following routes:
// PATCH /lobbies/:id (update lobby details)
function authenticateHostOrAdmin(req, res, next) {
    authenticateToken(req, res, async () => {
        const token = getToken(req);
        const scope = getJWTScope(token);
        const userId = req.user.sub;

        const lobby = await Lobby.findByPk(req.params.id);
        if (!lobby) {
            return res.status(404).send('Lobby not found');
        }

        if (scope.includes('admin') || userId == lobby.hostId) {
            next();
        } else {
            res.status(403).send("You must be the host or an admin to access this resource");
        }
    });
}

module.exports = {
    authenticateToken, 
    isRole, 
    authenticateOwnerOrAdmin, 
    authenticateInRoomOrAdmin, 
    authenticateHostOrPlayerOrAdmin, 
    authenticateHostOrAdmin,
    authSameUserInLobbyOrAdmin
};