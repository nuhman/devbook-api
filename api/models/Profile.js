const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    handle: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    company: {
        type: String,
        minlength: 2,
        maxlength: 100
    },
    location: {
        type: String,
        minlength: 2,
        maxlength: 100
    },
    status: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
    },
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String,
        minlength: 20,
        maxlength: 1000
    },
    experience: [
        {
            title: {
                type: String,
                required: true,
                maxlength: 100
            },
            company: {
                type: String,
                required: true,
                maxlength: 100
            },
            location: {
                type: String,
                maxlength: 100
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
                maxlength: 1000
            }
        }
        
    ],
    education: [
        {
            school: {
                type: String,
                required: true,
                maxlength: 100
            },
            degree: {
                type: String,
                required: true,
                maxlength: 100
            },
            field: {
                type: String,
                required: true,
                maxlength: 100
            },
            location: {
                type: String,
                maxlength: 100
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
                maxlength: 1000
            }
        }
    ],
    online: {
        twitter: {
            type: String,
            maxlength: 100
        },
        linkedin: {
            type: String,
            maxlength: 100
        },
        github: {
            type: String,
            maxlength: 100
        },
        portfolio: {
            type: String,
            maxlength: 100
        }
    },
    createdat: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
