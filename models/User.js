const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String
    },
});

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    notes: {
        type: [NoteSchema],
        default: [],
    },
});

module.exports = mongoose.model('User', UserSchema, "users_notes");