const mongoose = require('mongoose');
const {Schema} = mongoose;

const InventoryTransactionSchema = new Schema({
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'inventory',
        required: true
    },
    type: {
        type: String,
        enum: ['Restock', 'Usage'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
    },
    userid: { 
        type: String,
        required: true
    }
});

module.exports = mongoose.model('inventorytransaction', InventoryTransactionSchema);
