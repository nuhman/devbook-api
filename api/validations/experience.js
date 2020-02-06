const validator = require('validator');
const isEmpty = require('./utilities').isEmpty;


const validateExperienceInput = data => {
   let errors = {};

   data.title = !isEmpty(data.title) ? data.title : '';
   data.from = !isEmpty(data.from) ? data.from : '';
   data.company = !isEmpty(data.company) ? data.company : '';
   
   /*require('../models/Profile').schema.eachPath(p => fields.push(p));
   for (let key of fields) {
       data[key] = isEmpty(data[key]) ? '' : data[key];
   }*/
   
   if(!validator.isLength(data.title, { max: 100 })){
        errors.title = 'Job title must be less than 100 characters long';
    }

    if(data.location && !validator.isLength(data.location, { max: 100 })){
        errors.location = 'Location must be less than 100 characters long';
    }

    if(data.description && !validator.isLength(data.description, { max: 1000 })){
        errors.description = 'Description must be less than 1000 characters long';
    }

    if(!validator.isLength(data.company, { max: 100 })){
        errors.company = 'Company must be less than 100 characters long';
    }

   if(validator.isEmpty(data.title)) 
       errors.title = 'Title should not be empty';
      
   if(validator.isEmpty(data.company)) 
       errors.company = 'Company should not be empty';
   
    if(validator.isEmpty(data.from)) 
       errors.from = 'From Date should not be empty';
     

   return {
       errors,
       isValid: isEmpty(errors)
   }
}

module.exports = validateExperienceInput;