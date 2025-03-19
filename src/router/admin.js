const express = require('express')
// const { passwordEncryption } = require('../utils/validator')
const Admin = require('../models/admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const adminAuth = require('../middlewares/adminAuth')
const User = require('../models/user')
const { passwordEncryption } = require('../utils/validator')
const Sale = require('../models/sales')


const adminRouter = express.Router()


adminRouter.post('/admin/signup', async (req, res, next) => {

    try {
        const adminCount = await Admin.countDocuments()

        if (adminCount > 0) {
            throw new Error('admin is already there')
        }
        next()
    } catch (err) {
        return res.status(400).send("ERROR" + err.message)
    }

}, async (req, res) => {

    try {
        const { firstName, adminEmailId, adminPassword } = req.body

        const encryptPasswordHash = await bcrypt.hash(adminPassword, 10)
        // const passwordHash = await passwordEncryption(password, 10)
        console.log(encryptPasswordHash)

        const admin = new Admin({
            firstName,
            adminEmailId,
            adminPassword: encryptPasswordHash,
        })

        await admin.save()
        res.json({ message: 'welcome Admin', data: admin })
    } catch (err) {
        console.log(err)
        res.status(400).send('Error while signingUp' + err.message)
    }
})

adminRouter.post('/admin/login', async (req, res) => {

    try {
        const { adminEmailId, adminPassword } = req.body

        const findAdmin = await Admin.findOne({ adminEmailId: adminEmailId })

        if (!findAdmin) {
            // res.status(400).send('User not found or not verified. Please verify your email first.')
            return res.status(404).json('Admin not found')
        }

        const isAdminPasswordValid = await bcrypt.compare(adminPassword, findAdmin.adminPassword)

        if (isAdminPasswordValid) {

            const adminToken = await jwt.sign({ _id: findAdmin._id }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1d' })

            res.cookie('adminToken', adminToken, { expires: new Date(Date.now() + 8 * 3600000) })

            res.json({
                message: 'admin loggedIn succesfully', data: {
                    adminFirstName: findAdmin.firstName,
                    adminEmailId: findAdmin.adminEmailId
                }
            })
        } else {
            return res.status(401).json({ error: 'Invalid password' })
        }

    } catch (err) {

        res.status(400).send('ERROR' + err.message)
    }


})

adminRouter.post('/admin/logout', async (req, res) => {

    res.cookie('adminToken', null, { expires: new Date(Date.now()) })

    res.send('admin logout successfully')
})

adminRouter.get('/admin/getalluser', adminAuth, async (req, res) => {
    try {
        const loggedInAdmin = req.loggedInAdmin
        const allUsers = await User.find({})
        res.json({ data: allUsers })

    } catch (err) {
        res.status(400).send("ERROR" + err.message)
    }
})

adminRouter.patch('/admin/update/:userid', adminAuth, async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body
        const { userid } = req.params
        const matchedUser = await User.findOne({ _id: userid })
        // console.log(matchedUser)
        if (!matchedUser) {
            throw new Error('User not found')
        }

        if (password) {
            req.body.password = await passwordEncryption(password, 10)
        }

        Object.keys(req.body).forEach((key) => matchedUser[key] = req.body[key])

        await matchedUser.save()

        res.json({ message: "user update succesfully", data: matchedUser })
    } catch (err) {
        console.log(err.message)
    }

})

adminRouter.get('/admin/getallsale', adminAuth, async (req, res) => {
    try {
        const loggedInAdmin = req.loggedInAdmin
        const allSales = await Sale.find({})
        if (!allSales) {
            throw new Error('No sales yet')
        }
        res.json({ allSales })

    } catch (err) {
        res.status(400).send("ERROR" + err.message)
    }
})


adminRouter.get("/admin/profile/view", adminAuth, async (req, res) => {
    try {
        const user = req.loggedInAdmin
        res.send(user)

    } catch (err) {
        res.status(400).send("ERROR:" + err.message)
    }
})
module.exports = adminRouter