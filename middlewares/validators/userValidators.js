const {check, validationResult} = require('express-validator');

exports.validateUserSignUp = [
    check('username').trim().not().isEmpty().isLength({min:3,max:20}).withMessage('Usename must be within 3 to 20 characters.'),
    check('email').normalizeEmail().isEmail().withMessage('Invalid email.'),
    check('password').trim().not().isEmpty().isLength({min:6}).withMessage('Password must be min 3 characters.')
]
exports.userValidation = (req,res,next)=>{
    const result = validationResult(req).array()
    if(! result.length) return next();

    const error = result[0].msg;
    res.status(400).json({message:error})
}

