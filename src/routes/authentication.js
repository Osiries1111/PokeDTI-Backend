const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

async function createUser(req, res) {
    const userParams = req.body;
    const saltRounds = 4;
    const hashedPassword = await bcrypt.hash(userParams.password, saltRounds);

    const user = await User.create({
        username: userParams.username,
        password: hashedPassword,
        email: userParams.email,
        profileDescription: userParams.profileDescription,
        profileImgUrl: `https://ui-avatars.com/api/?name=${userParams.username}`,
    });
    res.status(201).json(user);
}

router.post('/signup', async (req, res) => {

    try {
        const authInfo = req.body;
        if (!authInfo || !authInfo.email)
            return res.status(400).json({ error: "Missing email in request body"});
        const user = await User.findOne({ where: { email: authInfo.email } });
        if (user)
            return res.status(400).json({ error: `The user by the email ${user.email} already exists` });
        await createUser(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/login", async (req, res) => {
    let user;
    const authInfo = req.body;
    let response = {};
    try {
        user = await User.findOne({ where: { email: authInfo.email } });
    }
    catch (error) {
        res.status(400).json({ error: error })
        return;
    }
    if (!user) {
        res.status(400).json({ error: `The user by the email '${authInfo.email}' was not found` })
        return;
    }
    const isPasswordCorrect = await bcrypt.compare(authInfo.password, user.password);
    if (isPasswordCorrect) {
        response = {
            username: user.username,
            email: user.mail,
        };
    } else {
        res.status(400).json({ error: "Incorrect password" });
        return;
    }
    const JWT_PRIVATE_KEY = process.env.JWT_SECRET;
    var token = jwt.sign(
        { scope: [user.type] },
        JWT_PRIVATE_KEY,
        {
            subject: user.id.toString(),
            expiresIn: "72h"
        }
    );

    response.access_token = token;
    response.token_type = "Bearer";
    response.expires_in = "72h";
    res.status(200).json(response);
})

module.exports = router;