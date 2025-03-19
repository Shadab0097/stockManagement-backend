const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_CLUSTER_URL)
};


module.exports = connectDB;


