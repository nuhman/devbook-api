const validator = require('validator');
const isEmpty = require('./utilities').isEmpty;
const ArrayHasEmptyString = require('./utilities').ArrayHasEmptyString;

const validateProfileInput = data => {
   let errors = {};
   let fields = [];

   data.handle = !isEmpty(data.handle) ? data.handle : '';
   data.status = !isEmpty(data.status) ? data.status : '';
   data.skills = !isEmpty(data.skills) ? data.skills : '';
   
   /*require('../models/Profile').schema.eachPath(p => fields.push(p));
   for (let key of fields) {
       data[key] = isEmpty(data[key]) ? '' : data[key];
   }*/
   
   if(!validator.isLength(data.handle, { min: 3, max: 30 })){
        errors.handle = 'Handle must be between 3 and 30 characters long';
    }

   if(validator.isEmpty(data.handle)) 
       errors.handle = 'Handle should not be empty';
   
    if(!validator.isLength(data.status, { min: 2, max: 100 })){
        errors.status = 'Status must be between 2 and 100 characters long';
    }

   if(validator.isEmpty(data.status)) 
       errors.status = 'Status should not be empty';
   
    if(ArrayHasEmptyString(data.skills, ",")) 
       errors.skills = 'One or more skill is empty. Also check for any leading or trailing commas.';

    if(validator.isEmpty(data.skills)) 
       errors.skills = 'Skills should not be empty';
    
    const websites = ["twitter", "linkedin", "github", "portfolio"];
    for (const site of websites){
        if(!isEmpty(data[site]) && !(validator.isURL(data[site])) ){
            errors[site] = `URL for '${site}' is not valid`;
        }
    }    

   return {
       errors,
       isValid: isEmpty(errors)
   }
}

module.exports = validateProfileInput;