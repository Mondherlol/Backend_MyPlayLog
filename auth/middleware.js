
require('dotenv').config()

//middleware n3ref bih ena logged in wale 
exports.loggedIn=(req, res, next) =>{
    if (req.user) {
        next();
    } else {
        res.redirect(`${process.env.IPADRESS}/login`);
    }
}
