const express = require('express')
const User = require('../models/user')
const adminAuth = require('../middlewares/adminAuth')
const { validateSignupData, passwordEncryption } = require('../utils/validator')


const addUserRouter = express.Router()




addUserRouter.post('/adduser', adminAuth, async (req, res) => {

    try {

        validateSignupData(req)
        const { password, emailId, firstName, lastName } = req.body

        // password encryption
        const passwordHash = await passwordEncryption(password, 10)

        const user = new User({
            emailId,
            firstName,
            lastName,
            password: passwordHash,

        })

        await user.save()
        res.send('User Added successfully!')
    } catch (err) {
        res.status(400).send("error while saving " + err.message)
    }
})

module.exports = addUserRouter