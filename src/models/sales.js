
const mongoose = require('mongoose')


const salesSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        require: true,
    },
    productPrice: {
        type: Number,
        require: true
    },
    productName: {
        type: String,
        require: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sellerName: {
        type: String,
        require: true
    },
    buyerName: {
        type: String,
        require: true
    },
    buyerAddress: {
        type: String,
        require: true
    },
    salesQuantity: {
        type: Number,
        require: true
    },
    emptyQuantity: {
        type: Number,
        require: true
    },
    paymentMode: {
        type: String,
        enum: {
            values: ["online", "cash",],
            message: `{value} is incorrect payment mode type`
        }
    }
}, { timestamps: true })

module.exports = mongoose.model("Sale", salesSchema)