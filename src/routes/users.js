const express = require('express');
const router = express.Router();
// const multer = require('multer');
// const upload = multer();
const { User } = require('../models');
const dotenv = require('dotenv');
const { authenticateToken, authenticateOwnerOrAdmin, isRole } = require('../controllers/authenticator');
const bcrypt = require('bcrypt');
// const cloudinary = require('cloudinary').v2;

dotenv.config();

async function getUsers(req, res) {
    const users = await User.findAll();
    res.status(200).json(users);
}

async function getUser(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'user not found' });
    res.status(200).json(user);
}

async function getPublicUsers(req, res) {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (ids.length === 0) {
        return res.status(400).json({ error: 'No user IDs provided' });
    }

    const users = await User.findAll({
        where: {
            id: ids
        },
        attributes: ['id', 'username', 'profileImgUrl']
    });
    res.status(200).json(users);
}

async function countUsers(req, res) {
    try {
        const count = await User.count();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function patchUser(req, res) {
    const userParams = { ...req.body };

    if (userParams.password) {
        const saltRounds = 4;
        const hashedPassword = await bcrypt.hash(userParams.password, saltRounds);
        userParams.password = hashedPassword;
    }
    await User.update(userParams, {
        where: {
            id: req.params.id
        }
    });
    res.status(200).json({ message: "User updated" });
}
async function deleteUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        await User.destroy({
            where: {
                id: req.params.id
            }
        });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleRoute(routeCallback, req, res) {
    try {
        await routeCallback(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// GET all users. Required role: admin
router.get('/', isRole("admin"), async (req, res) => {
    await handleRoute(getUsers, req, res);
});

// GET all users. Only public info. Required role: user
router.get('/public', authenticateToken, async (req, res) => {
    await handleRoute(getPublicUsers, req, res);
});

// GET user count. Required role: none
router.get('/count', countUsers);
// GET user by ID. Required role: same user or admin
router.get('/:id', authenticateOwnerOrAdmin, async (req, res) => {
    await handleRoute(getUser, req, res);
});
// PATCH user by ID. Required role: same user or admin
router.patch('/:id', authenticateOwnerOrAdmin, async (req, res) => {
    await handleRoute(patchUser, req, res);
});
// DELETE user by ID. Required role: same user or admin
router.delete('/:id', authenticateOwnerOrAdmin, async (req, res) => {
    await handleRoute(deleteUser, req, res);
});

module.exports = router;