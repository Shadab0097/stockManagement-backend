const express = require('express')
const { userAuth } = require('../middlewares/userAuth')
const Sale = require('../models/sales')
// const { validateProductData } = require('../utils/validator')
const Product = require('../models/product')
const adminAuth = require('../middlewares/adminAuth')
const mongoose = require('mongoose')

const salesRouter = express.Router()


salesRouter.post('/sale/:productId', userAuth, async (req, res) => {

    try {
        const { productId } = req.params
        const loggedInUser = req.user
        // validateProductData(req)


        const { salesQuantity, emptyQuantity = 0, buyerName, buyerAddress, mode } = req.body


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

        await product.save()



        await sale.save()

        res.json({ message: "sale recorded succesfully", data: sale })
    } catch (err) {
        res.status(500).send('Error' + err.message)
    }
})


salesRouter.get('/sales-summary', adminAuth, async (req, res) => {
    try {
        // Fetch sales data for all products
        const productSales = await Sale.aggregate([
            {
                $lookup: {
                    from: 'products', // Join with the 'products' collection
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }, // Unwind the joined product data
            {
                $group: {
                    _id: "$productId", // Group by productId
                    productName: { $first: "$product.productName" }, // Get the product name
                    totalSales: { $sum: "$salesQuantity" }, // Total sales quantity for the product
                    totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } } // Total payment for the product
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    productId: "$_id", // Rename _id to productId
                    productName: 1, // Include productName
                    totalSales: 1, // Include totalSales
                    totalPayment: 1 // Include totalPayment
                }
            }
        ]);

        // Calculate total sales and payment across all products
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
                    _id: null, // Group all documents together
                    totalQuantity: { $sum: "$salesQuantity" }, // Total sales quantity across all products
                    totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } } // Total payment across all products
                }
            }
        ]);

        res.json({
            productSales, // Sales data for all products
            totalSales: totalSalesSummary[0]?.totalQuantity || 0, // Total sales quantity across all products
            totalPayment: totalSalesSummary[0]?.totalPayment || 0 // Total payment across all products
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

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
                    totalPayment: { $sum: { $multiply: ["$salesQuantity", "$product.productPrice"] } }, // Use actual product price
                    totalProducts: { $addToSet: "$productId" } // Collect unique product IDs
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    totalQuantity: 1, // Include total sales quantity
                    totalPayment: 1, // Include total payment
                    totalProducts: { $size: "$totalProducts" } // Count unique products
                }
            }
        ]);

        res.json({
            totalSales: totalSalesSummary[0]?.totalQuantity || 0,
            totalPayment: totalSalesSummary[0]?.totalPayment || 0,
            totalProducts: totalSalesSummary[0]?.totalProducts || 0
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = salesRouter