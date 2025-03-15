const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        require: true,

    },
    productPrice: {
        type: Number,
        require: true
    },

    stockQuantity: {
        type: Number,
        require: true
    },
    emptyRecieved: {
        type: Number,
        require: true
    }

}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema)