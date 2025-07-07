const express = require('express');
const authRouter = require('./authentication');
const usersRouter = require('./users');
const lobbiesRouter = require('./lobbies');
const imagesRouter = require('./images');
const userInLobbyRouter = require('./userinlobby');
const router = express.Router();

router.use('/users', usersRouter);
router.use('/lobbies', lobbiesRouter);
router.use('/authentication', authRouter);
router.use('/images', imagesRouter);
router.use('/userinlobby', userInLobbyRouter);

module.exports = router;