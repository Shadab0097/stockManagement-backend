const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://khanofficial7229:TNERy7AqHbaZAdMG@nodejs.ve5ge.mongodb.net/stockManagement")
};


module.exports = connectDB;


