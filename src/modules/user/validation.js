import Joi from 'joi';

const userCreationSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.min': 'Name is too short',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(4).max(100).required().messages({
      'string.min': 'Password should be at least 4 characters long',
      'string.max': 'Password should be at most 100 characters long',
      'any.required': 'Password is required',
    }),
    code: Joi.string().required().messages({
      'any.required': 'Code is required',
    }),
    subject: Joi.string().valid('Technical', 'Culture', 'Manager').required().messages({
      'any.only': 'Invalid subject',
      'any.required': 'Subject is required',
    }),
    role: Joi.string().valid('Admin', 'SoftSkills', 'Teacher', 'rootAdmin').required().messages({
      'any.only': 'Invalid role',
      'any.required': 'Role is required',
    }),
    phoneNum: Joi.number().required().messages({
      'number.base': 'Phone number should be numeric',
      'any.required': 'Phone number is required',
    }),
  });
  
  // Validation middleware for user creation using Joi
 export const validateUserCreation = (req, res, next) => {
    const { error } = userCreationSchema.validate(req.body, { abortEarly: false });
  
    if (error) {
      const errors = error.details.map((detail) => ({ message: detail.message }));
      return res.status(400).json({ success: false, errors });
    }
  
    next();
  };
