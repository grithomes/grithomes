const mongoose = require('mongoose');
const {Schema} = mongoose;

const EstimateSchema = new Schema({
    // estimate_id: { type: Number, unique: true },
    estimate_id: { 
        type: Number
    },
    noteimageUrl:{
        type: String,
    },
    EstimateNumber: { type: String },
    customername: {
        type: String,
    },
    customeremail: {
        type: String,
    },
    purchaseorder: {
        type: String,
    },
    job: {
        type: String,
    },
    date: {
        type: Date,
    },
    emailsent: {
        type: String,
        default:'no'
    },
    description: {
        type: String,
    },
    items: [],
    subtotal: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
    },
    amountdue: {
        type: Number,
        default: 0,
    },
    information: {
        type: String,
    },
    tax: {
        type: String,
    },
    taxpercentage: {
        type: Number,
        default: 0,
    },
    userid:{
        type: String,
    },
    convertedToInvoice: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Estimate',EstimateSchema)