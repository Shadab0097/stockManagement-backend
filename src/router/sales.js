const express = require('express')
const { userAuth } = require('../middlewares/userAuth')
const Sale = require('../models/sales')
// const { validateProductData } = require('../utils/validator')
const Product = require('../models/product')
const adminAuth = require('../middlewares/adminAuth')
const mongoose = require('mongoose')

const salesRouter = express.Router()


salesRouter.post('/sale/:productId/:mode', userAuth, async (req, res) => {

    try {
        const { productId, mode } = req.params
        const loggedInUser = req.user
        // validateProductData(req)


        const { salesQuantity, emptyQuantity = 0, buyerName, buyerAddress } = req.body


        const allowedMode = ["online", "cash"]

        if (!allowedMode.includes(mode)) {

            return res.status(400).send('invalid payment mode')

        }


        const product = await Product.findOne({ _id: productId })
        if (!product) {
            throw new Error('Product not found')
        }

        if (salesQuantity <= 0) {
            throw new Error('Please enter a valid stockQuantity 🥫')
        } else if (emptyQuantity < 0) {
            throw new Error('Please enter a valid emptyRecieved 🫙')
        }

        // Check if enough stock is available
        if (product.stockQuantity < salesQuantity) {
            throw new Error('Insufficient stock')
        }

        // Update stock and empty quantity
        product.stockQuantity -= salesQuantity
        product.emptyRecieved += emptyQuantity
        await product.save()


        const sale = new Sale({
            productId: productId,
            productName: product.productName,
            productPrice: product.productPrice,
            sellerId: loggedInUser._id,
            sellerName: loggedInUser.firstName,
            salesQuantity: salesQuantity,
            emptyQuantity: emptyQuantity,
            buyerName,
            buyerAddress,
            paymentMode: mode

        })



        await sale.save()

        res.json({ message: "sale recorded succesfully", data: sale })
    } catch (err) {
        res.status(500).send('Error' + err.message)
    }
})


salesRouter.get('/sales-summary/:productId', adminAuth, async (req, res) => {
    try {
        const { productId } = req.params

        // 1. Total sales and payment for a single product
        let singleProductSales = null
        if (productId) {
            singleProductSales = await Sale.aggregate([
                { $match: { productId: new mongoose.Types.ObjectId(productId) } }, // Filter by productId
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: "$productId",
                        productName: { $first: "$product.productName" },
                        totalSales: { $sum: "$salesQuantity" },
                        totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } }
                    }
                }
            ])
        }

        // 2. Total sales and payment for all products
        const totalSalesSummary = await Sale.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$salesQuantity" },
                    totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } }
                }
            }
        ])

        res.json({
            singleProductSales: singleProductSales[0] || null,
            totalSales: totalSalesSummary[0]?.totalQuantity || 0,
            totalPayment: totalSalesSummary[0]?.totalPayment || 0
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

salesRouter.get('/total-sales', adminAuth, async (req, res) => {
    try {
        const totalSalesSummary = await Sale.aggregate([
            {
                $lookup: {
                    from: 'products', // Reference to Product collection
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product' // Convert array to object
            },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$salesQuantity" }, // Sum of sales
                    totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } } // Use actual product price
                }
            }
        ])

        res.json({
            totalSales: totalSalesSummary[0]?.totalQuantity || 0,
            totalPayment: totalSalesSummary[0]?.totalPayment || 0
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = salesRouter