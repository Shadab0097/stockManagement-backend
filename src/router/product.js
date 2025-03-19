const express = require('express')
const { validateProductData } = require('../utils/validator')
const Product = require('../models/product')
const adminAuth = require('../middlewares/adminAuth')
const { userAuth } = require('../middlewares/userAuth')

const productRouter = express.Router()

productRouter.post('/addproduct', adminAuth, async (req, res) => {
    try {
        validateProductData(req)
        const { productName, stockQuantity, emptyRecieved, productPrice } = req.body

        const findDuplicate = await Product.findOne({ productName })

        if (findDuplicate) {
            throw new Error("product already listed")
        }


        const product = new Product({
            productName,
            stockQuantity,
            emptyRecieved,
            productPrice
        })
        await product.save()
        res.json(product)
    } catch (err) {
        res.status(500).send('Error' + err.message)
    }
}),

    productRouter.patch("/update/product/:productId", adminAuth, async (req, res) => {
        try {
            const { productId } = req.params
            // const { productName, stockQuantity, emptyRecieved } = req.body
            validateProductData(req)

            const findProduct = await Product.findOne({ _id: productId })
            if (!findProduct) {
                throw new Error("product not found")
            }

            Object.keys(req.body).forEach((key) => findProduct[key] = req.body[key])

            await findProduct.save()
            res.json({
                message: "product update successfully",
                data: findProduct
            })

        } catch (err) {
            res.status(404).send('Error' + err.message)

        }
    })

productRouter.get("/admin/getallproduct", adminAuth, async (req, res) => {
    try {


        const findProduct = await Product.find({})
        if (!findProduct) {
            throw new Error("product not found")
        }

        res.json({
            message: " all product",
            data: findProduct
        })

    } catch (err) {
        res.status(404).send('Error' + err.message)

    }
})


productRouter.get("/getallproduct", userAuth, async (req, res) => {
    try {


        const findProduct = await Product.find({})
        if (!findProduct) {
            throw new Error("product not found")
        }

        res.json({
            message: " all product",
            data: findProduct
        })

    } catch (err) {
        res.status(404).send('Error' + err.message)

    }
})
module.exports = productRouter