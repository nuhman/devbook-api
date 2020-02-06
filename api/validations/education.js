const validator = require('validator');
const isEmpty = require('./utilities').isEmpty;


const validateEducationInput = data => {
   let errors = {};

   data.school = !isEmpty(data.school) ? data.school : '';
   data.degree = !isEmpty(data.degree) ? data.degree : '';
   data.field = !isEmpty(data.field) ? data.field : '';
   data.from = !isEmpty(data.from) ? data.from : '';

   
   /*require('../models/Profile').schema.eachPath(p => fields.push(p));
   for (let key of fields) {
       data[key] = isEmpty(data[key]) ? '' : data[key];
   }*/
   
   if(!validator.isLength(data.school, { max: 100 })){
        errors.school = 'School must be less than 100 characters long';
    }

    if(!validator.isLength(data.degree, { max: 100 })){
        errors.degree = 'Degree must be less than 100 characters long';
    }

    if(!validator.isLength(data.field, { max: 100 })){
        errors.field = 'Field of study must be less than 100 characters long';
    }

    if(data.location && !validator.isLength(data.location, { max: 100 })){
        errors.location = 'Location must be less than 100 characters long';
    }

    if(data.description && !validator.isLength(data.description, { max: 1000 })){
        errors.description = 'Description must be less than 1000 characters long';
    }


   if(validator.isEmpty(data.school)) 
       errors.school = 'School should not be empty';

    if(validator.isEmpty(data.degree)) 
       errors.degree = 'Degree should not be empty';
      
   if(validator.isEmpty(data.field)) 
       errors.field = 'Field should not be empty';
   
    if(validator.isEmpty(data.from)) 
       errors.from = 'From Date should not be empty';
     

   return {
       errors,
       isValid: isEmpty(errors)
   }
}

module.exports = validateEducationInput;