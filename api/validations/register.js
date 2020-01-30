     const validator = require('validator');
     const isEmpty = require('./utilities').isEmpty;

    const validateRegisterInput = data => {
        let errors = {};
        let fields = [];
        require('../models/User').schema.eachPath(p => fields.push(p));
        for (let key of fields) {
            data[key] = isEmpty(data[key]) ? '' : data[key];    
        }
        
        if(!validator.isLength(data.username, { min: 3, max: 30 })){
            errors.username = 'Username must be between 3 and 30 characters long';
        }

        if(!validator.isLength(data.fullname, { min: 3, max: 100 })){
            errors.fullname = 'Fullname must be between 3 and 100 characters long';
        }

        if(!validator.isLength(data.email, { min: 6, max: 100 })){
            errors.email = 'Email must be between 6 and 30 characters long';
        }

        if(!validator.isLength(data.password, { min: 8, max: 100 })){
            errors.password = 'Password must be more than 8 characters long';
        }

        if(validator.isEmpty(data.username)) 
            errors.username = 'Username should not be empty';
        
        if(validator.isEmpty(data.fullname)) 
            errors.fullname = 'Fullname should not be empty';

        if(!validator.isEmail(data.email)) 
            errors.email = 'Email is invalid';

        if(validator.isEmpty(data.email)) 
            errors.email = 'Email should not be empty';

        if(validator.isEmpty(data.password)) 
            errors.password = 'Password should not be empty';

        if(validator.isEmpty(data.gender)) 
            errors.gender = 'Gender should not be empty';

        return {
            errors,
            isValid: isEmpty(errors)
        }
    }

    module.exports = validateRegisterInput;