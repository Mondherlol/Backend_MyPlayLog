require('dotenv').config()

const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController2')
const passport = require('passport')
const User=require('../models/userModel')








//middleware n3ref bih ena logged in wale 
const loggedIn=(req, res, next) =>{
    if (req.user) {
        next();
    }
    else {
      res.status(200).json({message: 'tekhdemch' })
    }
}

//////////// LOGIN ROUTES //////////////
router.post('/register',userController.createUser);
router.post('/login',userController.login);
router.post('/logout',userController.logout);
router.post('/logged',loggedIn,userController.logged);
router.get('/logged',loggedIn,userController.logged);

router.get('/logged',loggedIn,userController.logged);



router.get("/auth/google",
  passport.authenticate('google', { scope: ["profile","email"] })
);

router.get("/auth/google/callback",
  passport.authenticate('google', { failureRedirect: `${process.env.IPADRESS}:3000/login` }),
  function(req, res) {
    // Successful authentication
    // res.status(200).json({ message: 'Successfully Authenticated' })
    res.redirect(`${process.env.IPADRESS}:3000/`);
});

//////////// other ROUTES //////////////
router.get('/search',userController.findUserByUsername)
router.get("/:id",userController.getUserById)




module.exports = router