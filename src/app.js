const express = require('express')
const connectDB = require('./config/database')
const app = express()
const cookieParser = require("cookie-parser");
// const cors = require('cors');

require("dotenv").config();

// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
// }));
app.use(express.json());
app.use(cookieParser());




const { userRouter } = require('./router/user');
const addUserRouter = require("./router/addUser");
const adminRouter = require("./router/admin");
const productRouter = require('./router/product')
const salesRouter = require('./router/sales')



// Use routers

app.use('/', userRouter);
app.use('/', adminRouter);
app.use('/', addUserRouter);
app.use('/', productRouter);
app.use('/', salesRouter);







connectDB().then(() => {
    console.log("database connected successfully");
    app.listen(3000, () => {
        console.log("Server is Running on port 3000")
    })
}).catch((err) => {
    console.log(err + " database connection failed")
})




