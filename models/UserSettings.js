const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    view_settings: {
        type: Object
    },
});

module.exports = mongoose.model('UserSettings', UserSettingsSchema, "users_settings");