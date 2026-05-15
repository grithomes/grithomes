const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

const mongoDB = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected successfully");
        const fetch_data = await mongoose.connection.db.collection("users");
    } catch (err) {
        console.log('MongoDB connection error: ', err);
    }
}

module.exports = mongoDB;