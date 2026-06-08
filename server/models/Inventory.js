const mongoose = require('mongoose');
const {Schema} = mongoose;

const InventorySchema = new Schema({
    materialName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    unit: {
        type: String,
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    userid: { 
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('inventory', InventorySchema);
