const validator = require('validator')
const bcrypt = require('bcrypt')


const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body

    if (!firstName || !lastName) {
        throw new Error('Please enter name 📛')
    } else if (!validator.isEmail(emailId)) {
        throw new Error('Please enter a valid Email 📩')
    } else if (!validator.isStrongPassword(password)) {
        throw new Error('Please enter a Strong password 🔑')
    }

}

const validateProductData = (req) => {
    const { productName, stockQuantity, emptyRecieved } = req.body

    if (!productName) {
        throw new Error('Please enter Product Name 📛')
    } else if (stockQuantity < 0) {
        throw new Error('Please enter a valid stockQuantity 🥫')
    } else if (emptyRecieved < 0) {
        throw new Error('Please enter a valid emptyRecieved 🫙')
    }

}

const passwordEncryption = (password, saltRound) => {
    return bcrypt.hash(password, saltRound)
}

const validateEditProfile = (req) => {
    const updateAllowed = ["firstName", "lastName", "about", "skills", "photoUrl", "gender", "age"]

    const isUpdateAllowed = Object.keys(req.body).every((key) => updateAllowed.includes(key))

    return isUpdateAllowed

}

const validateEditPassword = (req) => {

    const newPassword = req.body.password

    if (!validator.isStrongPassword(newPassword)) {
        throw new Error("enter Strong Password 👁️👁️")
    }

    const newPasswordValid = passwordEncryption(newPassword, 10)


    return newPasswordValid

}
module.exports = {
    validateSignupData,
    passwordEncryption,
    validateEditProfile,
    validateEditPassword,
    validateProductData
}