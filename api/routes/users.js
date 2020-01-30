require("dotenv").config();
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/User');
const validateRegisterInput = require('../validations/register');
const validateLoginInput = require('../validations/login');

/*
* @route    POST /api/users/register
* @desc     Register a new user
* @returns  created user object
* @access   Public
*/
router.post('/register', (req, res) => {

    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const getGender = (gender) => {      
        if(typeof gender === 'undefined')
            return 'N';

        switch(gender.toLowerCase()){
            case 'male':
                return 'M';
            case 'female':
                return 'F';
            default:
                return 'N';
        }
    }

    const getAvatar = (email) => {
        if(typeof email === 'undefined'){
            return 'http://www.gravatar.com/avatar/?d=mm';
        }
        return gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.RegistrationError = 'Email already exists ';
                return res.status(400).json(errors);
            }          
        });
        
    User.findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                errors.RegistrationError = 'Username already exists';
                return res.status(400).json(errors);
            }              
        });    

    const newUser = new User({
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        gender: getGender(req.body.gender),
        avatar: getAvatar(req.body.email)
    });

    bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) {
                errors.RegistrationError = 'Server Error. Please try again later.';
                res.status(500).json(errors);                    
            }
            newUser.password = hash;
            newUser.save()
                .then(user => res.json(user))
                .catch(err => {
                    res.status(500).json(errors);                    
                });
        });
    });

});


/*
* @route    POST /api/users/login
* @desc     Login  user
* @returns  jwt token
* @access   Public
*/
router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const usernameOrEmail = req.body.username;
    const password = req.body.password;

    User.findOne({$or: [
            {username: usernameOrEmail},
            {email: usernameOrEmail}            
        ]})
        .then(user => {
            if(!user){
                errors.LoginError = 'Incorrect username or password';
                return res.status(400).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        
                        const payload = {
                            id: user.id,
                            username: user.username,
                            avatar: user.avatar
                        }
                        jwt.sign(payload, process.env.SECRET, { expiresIn: 3600 }, (err, token) => {
                            errors.LoginError = 'Server Error. Please try again later.';
                            if(err) res.status(500).json(errors);
                            res.json({
                                'success': 'true',
                                'token': `Bearer ${token}`
                            })
                        });
                    } else {
                        errors.LoginError = 'Incorrect username or password';
                        return res.status(400).json(errors);
                    }                   
                }).catch(err => {
                    errors.LoginError = 'Server Error. Please try again later.';
                    return res.status(500).json(errors);
                });

        }).catch(err => {
            errors.LoginError = 'Server Error. Please try again later.';
            return res.status(500).json(errors);
        });
});

/*
* @route    GET /api/users/current
* @desc     Get currently logged in user
* @returns  object with user details
* @access   Private
*/
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userObj = {
        id: req.user.id,
        username: req.user.username,
        fullname: req.user.fullname,
        email: req.user.email,
        avatar: req.user.avatar
    }
    return res.json(userObj);
});


module.exports = router;