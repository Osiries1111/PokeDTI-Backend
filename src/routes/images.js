const cloudinary = require('cloudinary').v2;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { authenticateOwnerOrAdmin } = require('../controllers/authenticator');
const { UserInLobby } = require('../models');
const { Op } = require('sequelize');

async function uploadProfileImage(req, res) {
    const targetFolder = 'profile';
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.params.id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: req.params.id,
                folder: targetFolder,
                overwrite: true,
                display_name: `user_${req.params.id}`,
            },
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error uploading image' });
                }
                res.status(200).json({ message: "Image uploaded successfully", imageUrl: result.secure_url });
            }
        );
        stream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error uploading image' });
    }
}

async function uploadDressImage(req, res) {
    const targetFolder = 'dress';
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!req.params.id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const userInLobby = await UserInLobby.findOne({ where: { userId: req.params.id, [Op.not]: { status: 'exited' } } });
    if (!userInLobby) {
        return res.status(403).json({ error: 'User must be in a lobby to upload a dress image' });
    }

    // if (userInLobby.status !== 'dressing' && userInLobby.status !== 'finishedDressing') {
    //     return res.status(403).json({ error: 'User must be in dressing or finished dressing status to upload a dress image' });
    // }

    try {
        const stream = cloudinary.uploader.upload_stream(
            {
                public_id: req.params.id,
                folder: `${targetFolder}/lobby_${userInLobby.lobbyId}`,
                overwrite: true,
                display_name: `dress_user_${userInLobby.userId}`,
            },
            async (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Error uploading image' });
                }
                await UserInLobby.update(
                    { dressImgUrl: result.secure_url },
                    { where: { userId: req.params.id } }
                );
                res.status(200).json({ message: "Dress image uploaded successfully", imageUrl: result.secure_url });
            }
        );
        stream.end(file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error uploading image' });
    }
}

async function deleteImage(req, res) {
    const publicId = req.params.id;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            res.status(200).json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting image' });
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

router.post('/upload-profile/:id', upload.single('file'), authenticateOwnerOrAdmin, (req, res) => {
    handleRoute(uploadProfileImage, req, res);
});

router.post('/upload-dress/:id', upload.single('file'), authenticateOwnerOrAdmin, (req, res) => {
    handleRoute(uploadDressImage, req, res);
});

router.delete('/delete/:id', authenticateOwnerOrAdmin, (req, res) => {
    handleRoute(deleteImage, req, res);
});

module.exports = router;