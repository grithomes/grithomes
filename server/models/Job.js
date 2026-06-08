const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    ownerId: {
        type: String,
        required: true
    },
    invoiceId: {
        type: String, // Optional, links to an Invoice
        default: ""
    },
    assignedTeamMembers: [{
        type: String // Array of team member userids
    }],
    status: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('job', JobSchema);
