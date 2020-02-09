const validator = require('validator');
const isEmpty = require('./utilities').isEmpty;
const ArrayHasEmptyString = require('./utilities').ArrayHasEmptyString;

const validatePostInput = (data, isComment=false) => {

   let errors = {};
   let tag = isComment ? 'Comment' : 'Post';
   let min = isComment ? 6 : 20;
   let max = isComment ? 500 : 5000;
   
   data.text = !isEmpty(data.text) ? data.text : '';
   
   if(!validator.isLength(data.text, { min, max })){
        errors.text = `${tag} text must be between ${min} and ${max} characters long`;
    }

   if(validator.isEmpty(data.text)) 
       errors.text = `${tag} text should not be empty`; 

   return {
       errors,
       isValid: isEmpty(errors)
   }
}

module.exports = validatePostInput;
