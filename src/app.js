const express = require('express')

const app = express()

app.use('/test', (req, res) => {
    res.send('heelo from shadab khan')
})
app.use('/test/hello', (req, res) => {
    res.send('heelo from shadab khan 2')
})

app.listen(3000, () => {
    console.log("Server is Running on port 3000")
})