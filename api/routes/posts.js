const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');

const Post = require('../models/Post');
const Profile = require('../models/Profile');
const validatePostInput = require('../validations/post');


/*
* @route    POST /api/posts
* @desc     Create a new post
* @returns  object with post details
* @access   Private
*/
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const postFields = {};
    postFields.user = req.user.id;
    if(req.body.avatar) postFields.avatar = req.body.avatar;
    if(req.body.name) postFields.name = req.body.name;
    if(req.body.text) postFields.text = req.body.text;


    
    new Post(postFields).save()
        .then(post => {
            res.status(200).json(post);
        }).catch(err => {
            errors.PostsError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });

});


/*
* @route    GET /api/posts
* @desc     Get all posts
* @returns  array object with all posts
* @access   Public
*/
router.get('/',  (req, res) => {
    
    const errors = {};

    Post.find()
        .populate('user', ['username', 'fullname', 'email', 'avatar'])
        .sort({ createdat: -1 })
        .then(posts => {
            if(!posts) {
                errors.PostsError = 'No posts yet.';
                return res.status(404).json(errors);
            }
            res.json(posts);
        })
        .catch(err => {
            errors.PostsError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    GET /api/posts/:id
* @desc     Get post with given post id
* @returns  object with the post details
* @access   Public
*/
router.get('/:id',  (req, res) => {
    
    const errors = {};


    Post.findOne({ _id: req.params.id })
        .populate('user', ['username', 'fullname', 'email', 'avatar'])
        .then(post => {
            if(!post) {
                errors.PostsError = 'No post with the given id.';
                return res.status(404).json(errors);
            }
            console.log("post: " + req.params.id);
            res.json(post);
        })
        .catch(err => {
            errors.PostsError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});


/*
* @route    DELETE /api/posts/:id
* @desc     Delete the specific post by the given id
* @returns  object with all the remaining posts details
* @access   Private
*/

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};
    console.log("id: " + req.params.id);
    console.log(ObjectId.isValid(req.params.id));
    
    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.PostDeleteError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }

            if(post.user && (post.user.toString() !== req.user.id)){
                errors.AuthorizationError = 'No post exists by the given id for the logged in user';
                return res.status(404).json(errors);
            }

            post.remove().then(() => res.json({ delete: "success" }))               
                .catch(err => {
                    errors.PostDeleteError = 'Error while deleting post';
                    return res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.PostDeleteError = 'The id passed is not valid.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    PUT /api/posts/:id
* @desc     Update the specific post by the given id
* @returns  object with post details
* @access   Private
*/
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.PostUpdateError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }

            if(post.user && (post.user.toString() !== req.user.id)){
                errors.AuthorizationError = 'No post exists by the given id for the logged in user';
                return res.status(404).json(errors);
            }


            const postFields = post;
            
            if(req.body.text) postFields.text = req.body.text;
            postFields.updatedat = new Date().toISOString();
            postFields.save()
                .then(post => {
                    res.json(post);
                })
                .catch(err => {
                    errors.PostUpdateError = 'Error while saving data.';
                    console.log(err);
                    return res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.PostUpdateError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    POST /api/posts/like/:id
* @desc     Like or Unlike the specific post by the given id
* @returns  object with updated posts details
* @access   Private
*/

router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};
    console.log("id: " + req.params.id);
    console.log(ObjectId.isValid(req.params.id));
    
    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.PostsError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }

            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                // unlike
                post.likes = post.likes.filter(like => like.user.toString() !== req.user.id);
            } else{
                // like
                post.likes.unshift({ user: req.user.id });
            }            

            post.save()
                .then((updatedPost) => res.json(updatedPost))
                .catch(err => {
                    errors.PostLikeError = 'Error while saving the comment';
                    res.status(400).json(errors);
                });
            
        })
        .catch(err => {
            errors.PostLikeError = 'The id passed is not valid.';
            console.log(err);
            res.status(500).json(errors);
        });
});


/*
* @route    POST /api/posts/comment/:id
* @desc     Create a new comment for a given post id
* @returns  object with post details
* @access   Private
*/
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body, true);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            if(!post){
                errors.PostsError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }
            const comment = {};
            if(req.body.text) comment.text = req.body.text;
            if(req.body.name) comment.name = req.body.name;
            if(req.body.avatar) comment.avatar = req.body.avatar;
            comment.user = req.user.id;

            post.comments.unshift(comment);

            post.save()
                .then((updatedPost) => res.json(updatedPost))
                .catch(err => {
                    errors.PostCommentError = 'Error while saving the comment';
                    console.log(err);
                    res.status(400).json(errors);
                });

        })
        .catch(err => {
            errors.PostCommentError = 'The id passed is not valid.';
            console.log(err);
            res.status(500).json(errors);
        });

});

/*
* @route    POST /api/posts/comment/:id/:comment_id
* @desc     Delete the comment with the given comment_id and post id
* @returns  object with post details
* @access   Private
*/
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};

    Post.findById(req.params.id)
        .then(post => {
            if(!post){
                errors.PostsError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }
            
            const comment = post.comments.filter(c => c._id.toString() === req.params.comment_id);
            if(comment.length <= 0) {
                errors.PostCommentError = 'No comment exists by the given id';
                return res.status(404).json(errors);
            }
            if(comment[0].user.toString() !== req.user.id){
                errors.AuthorizationError = 'Permission Denied';
                return res.status(404).json(errors);
            }

            post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);

            post.save()
                .then((updatedPost) => res.json(updatedPost))
                .catch(err => {
                    errors.PostLikeError = 'Error while saving the comment';
                    res.status(400).json(errors);
                });

        })
        .catch(err => {
            errors.PostCommentError = 'The id passed is not valid.';
            console.log(err);
            res.status(500).json(errors);
        });

});


/*
* @route    PUT /api/posts/comment/:id/:comment_id
* @desc     Update the specific comment with the given comment_id and post id
* @returns  object with post details
* @access   Private
*/
router.put('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body, true);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.PostUpdateError = 'No post exists by the given id';
                return res.status(404).json(errors);
            }

            let index = -1;
            const comment = post.comments.filter((c, i) => {
                if(c._id.toString() === req.params.comment_id){
                    index = i;
                    return true;
                }
                return false;
            });
            if(comment.length <= 0) {
                errors.PostCommentError = 'No comment exists by the given id';
                return res.status(404).json(errors);
            }
            if(comment[0].user.toString() !== req.user.id){
                errors.AuthorizationError = 'Permission Denied';
                return res.status(404).json(errors);
            }


            const updateComment = comment[0];
            
            if(req.body.text) updateComment.text = req.body.text;
            updateComment.updatedat = new Date().toISOString();

            post.comments[index] = updateComment;

            post.save()
                .then(updatedPost => {
                    res.json(updatedPost);
                })
                .catch(err => {
                    errors.PostCommentError = 'Error while saving data.';
                    console.log(err);
                    return res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.PostCommentError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

module.exports = router;