const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        default: ""
    },
    authorName: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    authorModel: {
        type: String,
        enum: ['user', 'team'],
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('note', NoteSchema);
