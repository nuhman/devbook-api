const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 5000
    },
    name: {
        type: String       
    },
    avatar: {
        type: String
    },    
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
        
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true,        
                minlength: 6,
                maxlength: 500
            },
            name: {
                type: String       
            },
            avatar: {
                type: String
            },   
            createdat: {
                type: Date,
                default: Date.now
            },
            updatedat: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdat: {
        type: Date,
        default: Date.now
    },
    updatedat: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);
