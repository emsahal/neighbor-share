const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    role: {
        type: String,
        enum: ['Lender', 'Borrower', 'Guest'],
        default: 'Guest'
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        }
    }
],

}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);