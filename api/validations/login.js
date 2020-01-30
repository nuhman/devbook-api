const validator = require('validator');
const isEmpty = require('./utilities').isEmpty;

const validateLoginInput = data => {
   let errors = {};
   let fields = [];
   require('../models/User').schema.eachPath(p => fields.push(p));
   for (let key of fields) {
       data[key] = isEmpty(data[key]) ? '' : data[key]; 
   }
   
   if(validator.isEmpty(data.username)) 
       errors.username = 'Username should not be empty';
   
   if(validator.isEmpty(data.password)) 
       errors.password = 'Password should not be empty';

   return {
       errors,
       isValid: isEmpty(errors)
   }
}

module.exports = validateLoginInput;