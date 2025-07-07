const express = require('express');
const router = express.Router();
const { Lobby, UserInLobby } = require('../models');
const { authenticateToken,
        authenticateInRoomOrAdmin,
        isRole,
        authenticateHostOrAdmin } = require('../controllers/authenticator');
const { Op } = require('sequelize');

// Get all lobbies, including those with already finished
async function getAllLobbies(req, res) {
    const lobbies = await Lobby.findAll();
    res.status(200).json(lobbies);
}

// Get all active lobbies, excluding those with status 'finished'
async function getActiveLobbies(req, res) {
    const lobbies = await Lobby.findAll({
        where: {
            status: {
                [Op.not]: 'finished'
            }
        }
    });
    res.status(200).json(lobbies);
}

async function getLobby(req, res) {

    const lobbyId = req.params.id;

    if (!/^\d+$/.test(lobbyId)) {
        return res.status(400).json({ error: 'Invalid lobby id' });
    }

    const lobby = await Lobby.findByPk(req.params.id);
    if (!lobby)
        return res.status(404).json({ error: 'lobby not found' });
    res.status(200).json(lobby);
}

async function countLobbies(req, res) {
    
    const count = await Lobby.count();
    res.status(200).json({ count });

}


async function countUsersInLobbies(req, res) {

    const lobbyIds = req.query.ids ? req.query.ids.split(',') : [];
    if (lobbyIds.length === 0) {
        return res.status(400).json({ error: 'No lobby IDs provided' });
    }

    const counts = await Promise.all(lobbyIds.map(async (id) => {
        const count = await UserInLobby.count({
            where: { lobbyId: id, status: { [Op.not]: 'exited' } }
        });
        return { lobbyId: id, count };
    }));

    res.status(200).json(counts);
}


async function getUsersInLobby(req, res) {

    const lobbyId = req.params.id;

    if (!/^\d+$/.test(lobbyId)) {
        return res.status(400).json({ error: 'Invalid lobby id' });
    }

    const lobby = await Lobby.findByPk(lobbyId);

    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }

    if (lobby.status === 'finished') {
        return res.status(400).json({ error: 'Cannot get users from a finished lobby' });
    }

    const usersInLobby = await UserInLobby.findAll({
        where: {
            lobbyId: lobbyId,
            status: {
                [Op.not]: 'exited'
            }
        }
    });
    if (!usersInLobby || usersInLobby.length === 0) {
        return res.status(404).json({ error: 'No users found in this lobby' });
    }
    res.status(200).json(usersInLobby);
}

async function postLobby(req, res) {
    const lobby = await Lobby.create(req.body);
    res.status(200).json(lobby);
}

async function patchLobby(req, res) {
    const lobbyId = req.params.id;
    
    if (!/^\d+$/.test(lobbyId)) {
        return res.status(400).json({ error: 'Invalid lobby id' });
    }
    const lobby = await Lobby.findByPk(lobbyId);
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }

    await Lobby.update(req.body, {
        where: { id: lobbyId }
    });

    const updatedLobby = await Lobby.findByPk(lobbyId);
    res.status(200).json(updatedLobby);
}

async function deleteLobby(req, res) {
    const lobby = await Lobby.destroy({
        where: {
            id: req.params.id
        }
    });
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }
    res.status(200).json(lobby);
}

async function handleRoute(routeCallback, req, res) {
    try {
        await routeCallback(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// GET all lobbies (historical). requires admin role
router.get('/', isRole("admin"), async (req, res) => {
    await handleRoute(getAllLobbies, req, res);
});
// GET all active lobbies (not finished). Requires authentication
router.get('/active', authenticateToken, async (req, res) => {
    await handleRoute(getActiveLobbies, req, res);
});
// GET lobbies count. Requires admin role (for now)
router.get('/count', isRole("admin"), async (req, res) => {
    await handleRoute(countLobbies, req, res);
});
// GET count of users in given lobbies. Requires authentication
router.get('/count-users', authenticateToken, async (req, res) => {
    await handleRoute(countUsersInLobbies, req, res);
});
// GET lobby by ID. Role: user in lobby or admin
router.get('/:id', authenticateInRoomOrAdmin, async (req, res) => {
    await handleRoute(getLobby, req, res);
});
// GET users in a specific lobby. Role: user in lobby or admin
router.get('/:id/users', authenticateInRoomOrAdmin, async (req, res) => {
    await handleRoute(getUsersInLobby, req, res);
});

// POST create a new lobby. Role: user
router.post('/', authenticateToken, async (req, res) => {
    await handleRoute(postLobby, req, res);
});

// PATCH update a lobby by ID. Role: host of the lobby or admin
router.patch('/:id', authenticateHostOrAdmin, async (req, res) => {
    await handleRoute(patchLobby, req, res);
});

// DELETE a lobby by ID. Role: admin (lobbies are not deleted by default, only marked as finished)
router.delete('/:id', isRole("admin"), async (req, res) => {
    await handleRoute(deleteLobby, req, res);
});

module.exports = router;