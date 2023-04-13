require('dotenv').config()
const User = require('../models/userModel')

//findandCreate Oauth method
const findOrCreate = require('mongoose-findorcreate');
var GoogleStrategy = require('passport-google-oauth20').Strategy
const localStrategy=require('passport-local').Strategy
const bcrypt = require('bcrypt')

const mongoose=require('mongoose')
//tthaz fil .env 
const mongoURI='mongodb+srv://myplaylogdev:motarukibda123@myplaylog.qofddhp.mongodb.net/test'

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then((res)=>{console.log("MongoDB connected successfully")})
.catch((err)=>{console.log("MongoDB not connected")})


module.exports = (passport)=>{

    passport.use(
      new localStrategy((username,password,done)=>{
        User.findOne({ username: username }, function (err, user) {
          if(err) throw err
          if(!user) return done(null,false)
          
          bcrypt.compare(password, user.password, (err, result) => {
            if (err) throw err;
            if (result === true) {
            return done(null, user)
            } else {
            return done(null, false)
        }}
        )
        })
      })
    )


//tesn3 el cookie fl browser
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
      done(err, user);
  });
});


//lzmha ta7t serialize and deserialize user
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // callbackURL: "http://localhost:8000/api/user/auth/google/callback",
  callbackURL: `${process.env.IPADRESS}/api/user/auth/google/callback`,
 
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  //tthabet kn lmail mawjoud kn mawjoud tfassakh lcompte l9dim w tesn3 wehed bl google wela tkhalilou lmdp just tzidou google id w bla bla
  // Checki kn l email mawjoud walle
  User.findOne({ email: profile.emails[0].value })
    .then((user) => {
      if (user) {
        // email mawjoud 
        User.findOneAndUpdate(
          { email: profile.emails[0].value },
          {
            $set: {
              //mabadaltech lusername khtr bch kol mara y3ml logion yetbadalouch kima t3 lgoogle 
              googleId: profile.id,
              profilePic: profile.photos[0].value,
              email: profile.emails[0].value,
            },
          },
          { new: true, upsert: true }
        )
        .then((user) => {
          console.log('User updated:', user);
          cb(null, user);
        })
        .catch((err) => {
          console.log('Error updating user:', err);
          cb(err);
        });
      } else {
        // email mch mawjoud
        User.findOrCreate({ googleId: profile.id,username:profile.displayName,profilePic:profile.photos[0].value,email:profile.emails[0].value}, function (err, user) {
          return cb(err, user);
          });
      }
    })
    .catch((err) => {
      console.log('Error finding user:', err);
      cb(err);
    });

  
}
));

}

