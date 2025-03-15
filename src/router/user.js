const express = require('express')
const User = require('../models/user')
// const { validateSignupData, passwordEncryption } = require('../utils/validator')
const bcrypt = require('bcrypt')


const jwt = require('jsonwebtoken')
const { userAuth } = require('../middlewares/userAuth')
const Sale = require('../models/sales')


const userRouter = express.Router()


userRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body
        const user = await User.findOne({ emailId: emailId })

        if (!user) {
            res.status(400).send('User not found or not verified. Please verify your email first.')
            return
        }


        const isPasswordValid = await bcrypt.compare(password, user.password)


        if (isPasswordValid) {
            // create a cookie

            const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

            // send the cookie back to user
            res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) })
            res.send(user)
        } else {
            throw new Error("invalid Credentials")
        }
    } catch (err) {
        res.status(400).send(err.message)
    }
})
userRouter.post('/logout', async (req, res) => {

    res.cookie('token', null, { expires: new Date(Date.now()) })

    res.send('logout successfully')
})
userRouter.get('/user/sale', userAuth, async (req, res) => {

    try {
        const loggedInUser = req.user
        const userSales = await Sale.find({ sellerId: loggedInUser._id })
        // console.log(userSales)
        if (!userSales) {
            throw new Error('No sales yet')
        }
        res.json({ userSales })

    } catch (err) {
        res.status(400).send("ERROR" + err.message)
    }
})

module.exports = { userRouter }