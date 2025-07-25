const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema = new Schema({
    name: {
        type: String,
    },
    emails: {
        type: [String],
        required: true
    },
    number: {
        type: String,
    },
    information: {
        type: String,
    },
    address1: {
        type: String,
    },
    address2: {
        type: String,
    },
    country: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    city: {
        type: String,
        // required: true
    },
    countryid: {
        type: Number,
        required: false
    },
    stateid: {
        type: Number,
        // required: true
    },
    cityid: {
        type: Number,
        // required: true
    },
    countrydata: {
        type: String,
    },
    statedata: {
        type: String,
    },
    citydata: {
        type: String,
    },
    userid: {
        type: String,
    },
    post: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Customerlist', CustomerSchema)