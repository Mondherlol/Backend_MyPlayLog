const dotenv = require('dotenv')
dotenv.config() 

const User= require('../models/userModel')
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const passport=require('passport')



//tthaz fil .env 
const mongoURI='mongodb+srv://myplaylogdev:motarukibda123@myplaylog.qofddhp.mongodb.net/test'

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then((res)=>{console.log("MongoDB connected successfully")})
.catch((err)=>{console.log("MongoDB not connected")})



// nchfha b req.session  


exports.createUser=async (req,res)=>{
    const {username,email,password}=req.body
    User.findOne({ username : username.toLowerCase() })
    .then(async (user) => {
      if (user) {
        //user mawjoud
        return res.status(201).json({ message: 'Username already exists' })
      } else {
        //mch mawjoud

        //verif kn email mawjoud deja
        User.findOne({ email : email.toLowerCase() })
        .then(async (user) => {
        if (user) { 
          return res.status(201).json({ message: 'email already exists' })
        }else {
        //nhashi lpassword
        const hashedPassword=await bcrypt.hash(password,8)
        const newUser = new User({ username, email, password:hashedPassword ,profilePic:"https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg"})
        newUser.save()
          .then(() => {
            // c bon tsajel
            res.status(200).json({ message: 'User created successfully' })
          })
          .catch((error) => {
            // matsajalch
            res.status(400).json({ message:'user not registered',error: error.message })
          });
        }
      })


   
      }
    })
    .catch((error) => {
      //error fi talwij l user
      res.status(400).json({ error: error.message })
    });

}

exports.login=async (req,res,next)=>{
    passport.authenticate("local",(err,user,info)=>{
        if (err) throw err
        if(!user) res.status(200).json({ message: 'No User Exists' })
        else {
            req.logIn(user, err =>{
                if (err) throw err
                res.status(200).json({ message: 'Successfully Authenticated' })                
            })
        }
    })(req,res,next)
}

exports.logout=(req,res)=>{
    req.logOut(function(err) {
        if (err) { return next(err); }
        res.status(200).json({ message: 'User logged out' })
      });
    
}



exports.logged=(req,res)=>{
    // res.send(req.user)
      res.status(200).json({ user:req.user,message: 'Successfully Authenticated' })
  
    
}


exports.usernameExists=(req,res)=>{
  const {username}=req.body
    User.findOne({ username })
    .then(async (user) => {
      if (user) {
        //user mawjoud
        return res.status(201).json({ message: 'Username already exists' })
      } else {
        //mch mawjoud
        return res.status(201).json({ message: 'Username available' })
      }})
}


// search user bl username
exports.findUserByUsername = async (req, res) => {
  const { username } = req.query
  try {
  
    const users = await User.find(
      //tkhalini nlwj hata usernames similar wela that follows the same pattern
      { username: { $regex: new RegExp(username, "i") } },
    "-password" //without password
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" })
    }
    return res.status(200).json({ users })
  } catch (error) {
    return res.status(400).json({ message: "Error finding users", error })
  }
};


exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id // Récupère l'ID de l'utilisateur dans la requête
    const user = await User.findById(userId) // Cherche l'utilisateur correspondant dans la base de données

    if (!user) {
      // Si aucun utilisateur trouvé, renvoie une réponse avec un message d'erreur
      return res.status(404).json({ message: 'User not found' })
    }

    // Si l'utilisateur est trouvé, renvoie une réponse avec l'utilisateur trouvé
    res.status(200).json({ user })
  } catch (error) {
    // Si une erreur se produit, renvoie une réponse avec un message d'erreur
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id; // Récupère l'ID de l'utilisateur 
    console.log(id)
    console.log(req.body)
    const { profilePic, coverPic, bio } = req.body; // Récupère les nouvelles données de l'utilisateur
    console.log(coverPic)

    // Vérifie si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Met à jour les données de l'utilisateur
    if (coverPic) user.coverPic = coverPic;
    if (bio) user.bio = bio;
    if (profilePic) user.profilePic = profilePic;

    // Enregistre les modifications dans la base de données
    await user.save();

    // Renvoie une réponse avec les nouvelles données de l'utilisateur
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    // Si une erreur se produit, renvoie une réponse avec un message d'erreur
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
