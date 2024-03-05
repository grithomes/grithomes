const mongoose = require('mongoose');
const {Schema} = mongoose;

const InvoiceSchema = new Schema({
    // unique_id: { type: Number, unique: true },
    invoice_id: { type: Number },
    InvoiceNumber: { 
        type: String 
    },
    customername: {
        type: String,
    },
    customeremail: {
        type: String,
    },
    purchaseorder: {
        type: String,
    },
    date: {
        type: Date,
    },
    duedate: {
        type: Date,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model('Invoice',InvoiceSchema)