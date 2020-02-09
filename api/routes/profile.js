const express = require('express');
const router = express.Router();
const passport = require('passport');
const ObjectId = require('mongoose').Types.ObjectId;

const Profile = require('../models/Profile');
const User = require('../models/User');
const validateProfileInput = require('../validations/profile');
const validateExperienceInput = require('../validations/experience');
const validateEducationInput = require('../validations/education');


/*
* @route    GET /api/profile
* @desc     Get current logged in user's profile
* @returns  object with user profile details
* @access   Private
*/
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};
    
    Profile.findOne({ user: req.user.id })
        .populate('user', ['username', 'fullname', 'email', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the logged in user';
                res.status(404).json(errors);
            }
            res.status(200).json(profile);
        }).catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    POST /api/users/current
* @desc     Create or Update the current user's profile
* @returns  object with user profile details
* @access   Private
*/
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { errors, isValid } = validateProfileInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    //if(req.body.handle) profileFields.handle = req.body.handle;
    profileFields.handle = req.user.username;
    if(req.body.company) profileFields.company = req.body.company;
    //if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',').map(skill => skill.trim());        
    }        
    if(req.body.bio) profileFields.bio = req.body.bio;

    //online
    profileFields.online = {};
    if(req.body.twitter) profileFields.online.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.online.linkedin = req.body.linkedin;
    if(req.body.github) profileFields.online.github = req.body.github;
    if(req.body.portfolio) profileFields.online.portfolio = req.body.portfolio;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile){
                //update
                Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields },
                    { new: true }
                ).then(updatedProfile => res.json(updatedProfile))
                .catch(err => {
                    errors.ProfileUpdateError = 'Error while updating profile';
                    res.status(400).json(errors);
                });
            } else {
              //create 
              //check if handle exists
              Profile.findOne({ handle: profileFields.handle })
                .then(profile => {
                    if(profile){
                        errors.ProfileCreateEroor = 'Handle already exists';
                        res.status(400).json(errors);
                    }

                    //save profile
                    new Profile(profileFields)
                        .save()
                        .then(newProfile => {
                            res.json(newProfile);
                        }).catch(err => {
                            errors.ProfileCreateEroor = 'Server Error. Please try again later.';
                            return res.status(500).json(errors);
                        });
                }).catch(err => {
                    errors.ProfileCreateEroor = 'Server Error. Please try again later.';
                    return res.status(500).json(errors);
                });

            }
        }).catch(err => {
            errors.ProfileUpdateError = 'UserId does not exist';
            res.status(404).json(errors);
        });  
});


/*
* @route    GET /api/profile/all
* @desc     Get the profile for all the applicable users
* @returns  Array with all user profile details
* @access   Public
*/
router.get('/all', (req, res) => {
    const errors = {};    
    Profile.find()
        .populate('user', ['username', 'fullname', 'email', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.ProfileError = 'No profiles exist in the database';
                res.status(404).json(errors);
            }
            res.json(profiles);
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});


/*
* @route    GET /api/profile/user/:usernameOrId
* @desc     Get the profile for the given username or userid
* @returns  object with user profile details
* @access   Public
*/
router.get('/user/:usernameOrId', (req, res) => {
    const errors = {};
    const objId = new ObjectId( (req.params.usernameOrId.length < 12) ? "123456789012" : req.params.usernameOrId );
    Profile.findOne({$or: [
            {handle: req.params.usernameOrId},
            {user: objId}            
        ]})
        .populate('user', ['username', 'fullname', 'email', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the given username';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    POST /api/profile/experience
* @desc     Get the profile for the given username or userid
* @returns  object with user profile details
* @access   Private
*/
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { errors, isValid } = validateExperienceInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the given username';
                res.status(404).json(errors);
            }
            const experienceFields = {};
            if(req.body.title) experienceFields.title = req.body.title;
            if(req.body.company) experienceFields.company = req.body.company;
            if(req.body.location) experienceFields.location = req.body.location;
            if(req.body.from) experienceFields.from = req.body.from;
            if(req.body.to) experienceFields.to = req.body.to;            
            if(req.body.description) experienceFields.description = req.body.description;
            if(req.body.current) experienceFields.current = req.body.current;
            else{
                if(!req.body.to)
                    req.body.current = true;
            }

            profile.experience.unshift(experienceFields);

            profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});


/*
* @route    POST /api/profile/education
* @desc     Get the profile for the given username or userid
* @returns  object with user profile details
* @access   Private
*/
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { errors, isValid } = validateEducationInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the given username';
                res.status(404).json(errors);
            }
            const educationFields = {};
            if(req.body.school) educationFields.school = req.body.school;
            if(req.body.degree) educationFields.degree = req.body.degree;
            if(req.body.field) educationFields.field = req.body.field;
            if(req.body.location) educationFields.location = req.body.location;
            if(req.body.from) educationFields.from = req.body.from;            
            if(req.body.to) educationFields.to = req.body.to;
            if(req.body.description) educationFields.description = req.body.description;
            if(req.body.current) educationFields.current = req.body.current;
            else{
                if(!req.body.to)
                    req.body.current = true;
            }

            profile.education.unshift(educationFields);

            profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});



/*
* @route    DELETE /api/profile/experience/:exp_id
* @desc     Delete the specific experience in the profile for the given id
* @returns  object with user profile details
* @access   Private
*/
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the logged in user';
                res.status(404).json(errors);
            }

            const removeIndex = profile.experience.filter(e => e.id === req.params.exp_id);
            if(removeIndex.length > 0){
                profile.experience.splice(removeIndex[0], 1);
                profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            } else {
                errors.ProfileError = 'No experience exists for the given id';
                console.log(err);
                res.status(500).json(errors);
            }                  
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    DELETE /api/profile/education/:edu_id
* @desc     Delete the specific education in the profile for the given id
* @returns  object with user profile details
* @access   Private
*/
router.delete('/education/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the logged in user';
                res.status(404).json(errors);
            }

            const removeIndex = profile.education.filter(e => e.id === req.params.exp_id);
            if(removeIndex.length > 0){
                profile.education.splice(removeIndex[0], 1);
                profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            } else {
                errors.ProfileError = 'No education exists for the given id';
                console.log(err);
                res.status(500).json(errors);
            }  
            
            
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});


/*
* @route    PUT /api/profile/experience/:exp_id
* @desc     Update the specific experience in the profile for the given id
* @returns  object with user profile details
* @access   Private
*/
router.put('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateExperienceInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the logged in user';
                res.status(404).json(errors);
            }

            let index = -1;
            const item = profile.experience.filter((e, i) => {
                if(e.id === req.params.exp_id){
                    index = i;
                    return true;
                }
                return false;
            });
            
            if(item.length <= 0){
                errors.ProfileError = 'No experience exists for the given id';
                res.status(404).json(errors);
            }


            const experienceFields = item[0];
            if(req.body.title) experienceFields.title = req.body.title;
            if(req.body.company) experienceFields.company = req.body.company;
            if(req.body.location) experienceFields.location = req.body.location;
            if(req.body.from) experienceFields.from = req.body.from;
            if(req.body.to) experienceFields.to = req.body.to;            
            if(req.body.description) experienceFields.description = req.body.description;
            if(req.body.current) experienceFields.current = req.body.current;
            else{
                if(!req.body.to)
                    req.body.current = true;
            }

            profile.experience[index] = experienceFields;

            profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

/*
* @route    PUT /api/profile/education/:exp_id
* @desc     Update the specific education in the profile for the given id
* @returns  object with user profile details
* @access   Private
*/
router.put('/education/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateEducationInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.ProfileError = 'No profile exists for the logged in user';
                res.status(404).json(errors);
            }

            let index = -1;
            const item = profile.education.filter((e, i) => {
                if(e.id === req.params.exp_id){
                    index = i;
                    return true;
                }
                return false;
            });
            
            if(item.length <= 0){
                errors.ProfileError = 'No education exists for the given id';
                res.status(404).json(errors);
            }


            const educationFields = {};
            if(req.body.school) educationFields.school = req.body.school;
            if(req.body.degree) educationFields.degree = req.body.degree;
            if(req.body.field) educationFields.field = req.body.field;
            if(req.body.location) educationFields.location = req.body.location;
            if(req.body.from) educationFields.from = req.body.from;            
            if(req.body.to) educationFields.to = req.body.to;
            if(req.body.description) educationFields.description = req.body.description;
            if(req.body.current) educationFields.current = req.body.current;
            else{
                if(!req.body.to)
                    req.body.current = true;
            }

            profile.education[index] = educationFields;

            profile.save()
                .then(profile => {
                    res.json(profile);
                })
                .catch(err => {
                    errors.ProfileError = 'Error while saving data.';
                    console.log(err);
                    res.status(500).json(errors);
                });
            
        })
        .catch(err => {
            errors.ProfileError = 'Server Error. Please try again later.';
            console.log(err);
            res.status(500).json(errors);
        });
});

module.exports = router;