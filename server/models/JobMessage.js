const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobMessageSchema = new Schema({
    jobId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorModel: {
        type: String,
        enum: ['user', 'team'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('jobMessage', JobMessageSchema);
