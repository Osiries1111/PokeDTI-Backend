const express = require('express');
const router = express.Router();
const { UserInLobby, Lobby, User, VotedFor, Report } = require('../models');
const { authenticateToken,
    authenticateOwnerOrAdmin,
    isRole,
    authenticateHostOrPlayerOrAdmin,
    authenticateInRoomOrAdmin, // eslint-disable-line no-unused-vars
    authSameUserInLobbyOrAdmin } = require('../controllers/authenticator');
const { Op } = require('sequelize');

// Get user in lobby by userInLobby ID

async function getUserInLobby(req, res) {
    const userInLobby = await UserInLobby.findByPk(req.params.id);
    if (!userInLobby) {
        return res.status(404).json({ error: 'User in lobby not found' });
    }
    res.status(200).json(userInLobby);
}

// Get user in lobby by user ID and lobby ID

async function getMyUserInLobby(req, res) {
    const userId = req.params.id;
    const lobbyId = req.query.lobby;
    const userInLobby = await UserInLobby.findOne({
        where: {
            userId: userId,
            lobbyId: lobbyId,
            status: {
                [Op.not]: 'exited'
            },

        }
    });
    if (!userInLobby) {
        return res.status(404).json({ error: 'No active user found in lobby' });
    }
    res.status(200).json(userInLobby);
}

// Get all users in all lobbies (historical data)
async function getAllUsersInLobbies(req, res) {
    const usersInLobby = await UserInLobby.findAll();
    res.status(200).json(usersInLobby);
}

// This endpoint allows a user to join a lobby by providing the lobby ID in the request body
// POST /userinlobby/:id
async function createUserInLobby(req, res) {

    const userId = req.params.id;

    // Validate user ID in the request parameters
    if (!userId || !/^\d+$/.test(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate request body


    if (!req.body || typeof req.body.lobbyId === "undefined") {
        return res.status(400).json({ error: 'Lobby ID is required' });
    }

    const { lobbyId } = req.body;

    // Validate lobby ID in the request body
    if (!/^\d+$/.test(lobbyId)) {
        return res.status(400).json({ error: 'Invalid lobby ID' });
    }

    // Check if joining user exists

    const user = await User.findByPk(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Check if the lobby exists

    const lobby = await Lobby.findByPk(req.body.lobbyId);
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }

    // Check if user exists in any lobby
    const existingUserInLobby = await UserInLobby.findOne({
        where: {
            userId: req.params.id,
            status: { [Op.not]: 'exited' }
        }
    });
    if (existingUserInLobby) {
        return res.status(400).json({ error: 'User already in a lobby' });
    }


    // Check if room is full
    const userCount = await UserInLobby.count({
        where: {
            lobbyId: req.body.lobbyId,
            status: { [Op.not]: 'exited' }
        }
    });

    if (userCount >= lobby.maxPlayers) {
        return res.status(403).json({ error: 'Cannot join. Lobby is full' });
    }

    // Check if lobby is waiting for users
    if (lobby.status !== 'waitingForPlayers') {
        return res.status(403).json({ error: ` Cannot join lobby ${lobbyId}. Lobby is currently ${lobby.status}` });
    }

    // Create the UserInLobby entry

    const userInLobby = await UserInLobby.create({
        userId: req.params.id,
        lobbyId: req.body.lobbyId,
    });
    res.status(201).json(userInLobby);
}

// Deletes an specific userinlobby by ID
// DELETE /userinlobby/:id
async function deleteUserInLobby(req, res) {

    const userInLobby = await UserInLobby.findByPk(req.params.id);
    if (!userInLobby) {
        return res.status(404).json({ error: 'User is not or never was in a lobby' });
    }
    await userInLobby.destroy();
    res.status(204).send();
}
// Leave a lobby or kick a user from a lobby. This just changes the status of the user in the lobby to 'exited'.
// PATCH /userinlobby/leave/:id

async function leaveOrKickUserFromLobby(req, res) {

    // Middleware checks if userinlobby and lobby exist. Also validates permissions.
    const userInLobby = await UserInLobby.findByPk(req.params.id);
    if (!userInLobby) {
        return res.status(404).json({ error: 'User never was in a lobby' });
    }

    if (userInLobby.status === 'exited') {
        return res.status(400).json({ error: 'User left the lobby alredy' });
    }

    userInLobby.status = 'exited';
    await userInLobby.save();
    res.status(200).json({ message: `User ${userInLobby.userId} has left the lobby ${userInLobby.lobbyId} succesfully ` });
}

async function patchUserInLobby(req, res) {
    // Middleware checks if userinlobby and lobby exist. Also validates permissions.
    const userInLobby = await UserInLobby.findByPk(req.params.id);
    if (!userInLobby) {
        return res.status(404).json({ error: 'User is not or never was in a lobby' });
    }

    // Validate request body
    if (!req.body) {
        return res.status(400).json({ error: 'Request body is required' });
    }

    const updatedUser = await userInLobby.update(req.body);
    if (!updatedUser) {
        return res.status(400).json({ error: 'Failed to update user in lobby' });
    }
    res.status(200).json(updatedUser);
}

async function handleRoute(routeCallback, req, res) {
    try {
        await routeCallback(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

router.get('/', isRole("admin"), async (req, res) => {
    await handleRoute(getAllUsersInLobbies, req, res);
}
);

router.get('/votes', authenticateToken, async (req, res) => {

    const votes = await VotedFor.findAll();

    if (!votes) {
        return res.status(404).json({ error: 'No votes found' });
    }

    res.status(200).json(votes);
}
);

router.get('/reports', isRole("admin"), async (req, res) => {
    const reports = await Report.findAll({
        include: [
            {
                model: UserInLobby,
                as: 'reportingUserInLobby',
                attributes: ['dressImgUrl'],
                include: [{ model: User, attributes: ['id', 'username'] }]
            },
            {
                model: UserInLobby,
                as: 'reportedUserInLobby',
                attributes: ['dressImgUrl'],
                include: [{ model: User, attributes: ['id', 'username'] }]
            }
        ]
    });
    if (!reports) {
        return res.status(404).json({ error: 'No reports found' });
    }
    res.status(200).json(reports);
}
);

router.get('/:id', authenticateToken, async (req, res) => {
    await handleRoute(getUserInLobby, req, res);
}
);

router.get('/me/:id', authenticateOwnerOrAdmin, async (req, res) => {
    await handleRoute(getMyUserInLobby, req, res);
}
);

// Joins an user with :id to a lobby specified in the request body
router.post('/:id', authenticateOwnerOrAdmin, async (req, res) => {
    await handleRoute(createUserInLobby, req, res);
}
);

router.delete('/:id', isRole("admin"), async (req, res) => {
    await handleRoute(deleteUserInLobby, req, res);
}
);

router.patch('/leave/:id', authenticateHostOrPlayerOrAdmin, async (req, res) => {
    await handleRoute(leaveOrKickUserFromLobby, req, res);
});

// votes

router.get('/:idVoter/votesFor/:idVotee', authenticateToken, async (req, res) => {
    const { idVoter, idVotee } = req.params;
    const vote = await VotedFor.findOne({
        where: {
            votingUserId: idVoter,
            votedUserId: idVotee
        }
    });
    if (!vote) {
        return res.status(404).json({ error: 'Vote not found' });
    }
    res.status(200).json(vote);
});

router.post('/:idVoter/votesFor/:idVotee', authenticateToken, async (req, res) => {
    const { idVoter, idVotee } = req.params;
    let vote = await VotedFor.findOne({
        where: {
            votingUserId: idVoter,
            votedUserId: idVotee
        }
    });
    if (vote)
        return res.status(400).json({ error: 'vote already exists' });
    vote = await VotedFor.create({
        votedUserId: idVotee,
        votingUserId: idVoter
    });
    res.status(201).json(vote);
});

router.get('/:id/votes', authenticateToken, async (req, res) => {
    const userInLobbyId = req.params.id;
    const votes = {
        votedFor: await VotedFor.findAll({
            attributes: ['votedUserId'],
            where: { votingUserId: userInLobbyId },
            include: UserInLobby
        }),
        votedBy: await VotedFor.findAll({
            attributes: ['votingUserId'],
            where: { votedUserId: userInLobbyId },
            include: UserInLobby
        })
    };
    res.status(200).json(votes);
});


router.patch('/:id', authSameUserInLobbyOrAdmin, async (req, res) => {
    await handleRoute(patchUserInLobby, req, res);

});

router.delete('/:voterId/votesFor/:voteeId', authenticateToken, async (req, res) => {
    const { voterId, voteeId } = req.params;
    const vote = await VotedFor.findOne({
        where: {
            votingUserId: voterId,
            votedUserId: voteeId
        }
    });
    if (!vote)
        return res.status(404).json({ error: "vote not found" });
    await vote.destroy();
    res.status(204).send();

});

// Note: This endpoint is commented out because it is not used in the frontend. Admin just uses the /reports endpoint to see all reports.
// router.get('/:id/reports', isRole("admin"), async (req, res) => {
//     const userInLobbyId = req.params.id;
//     const reports = {
//         reportedTo: await Report.findAll({
//             attributes: ['reportedUserInLobbyId'],
//             where: {
//                 reportingUserInLobbyId: userInLobbyId
//             },
//             include: UserInLobby
//         }),
//         reportedBy: await Report.findAll({
//             attributes: ['reportingUserInLobbyId'],
//             where: {
//                 reportedUserInLobbyId: userInLobbyId
//             },
//             include: UserInLobby
//         })
//     };
//     res.status(200).json(reports);
// 
// });

router.post('/:reporterId/reports/:reporteeId', authenticateToken, async (req, res) => {
    const { reporterId, reporteeId } = req.params;
    
    if (!req.body || !req.body.reason) {
        return res.status(400).json({ error: 'Request body is required and must contain a reason' });
    }

    const reason = req.body.reason;


    // Commenting this cause a player can report another player multiple times
    //let report = await Report.findOne({
    //    where: {
    //        reportingUserInLobbyId: reporterId,
    //        reportedUserInLobbyId: reporteeId
    //    }
    //});
    //if (report)
    //    return res.status(400).json({error: 'report already exists'});
    try {
        const report = await Report.create({
            reportingUserInLobbyId: reporterId,
            reportedUserInLobbyId: reporteeId,
            reason: reason
        });
        res.status(201).json(report);
    }
    catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/reports/:id', isRole("admin"), async (req, res) => {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: "report not found" });
    
    await report.destroy();
    res.status(204).send();
});

module.exports = router;