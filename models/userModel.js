const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const findOrCreate = require('mongoose-findorcreate');


const userSchema= mongoose.Schema({
    username:{type:String, required:true, maxLength:30,unique: true},
    email:{type:String, required:false,unique: true},
    password:{type:String, required:false},
    bio:{type:String, required:false, maxLength:128},
    profilePic:{type:String, required:false},
    coverPic:{type:String, required:false},
    // admin:{type:Boolean, required:true}, // admin / regular 
    private:{type:Boolean, default:false}, // public / private
    games:{type:[{
        id_IGDB :{type:Number, required:true},
        timePlayed :{type:Number, required:false},
        progressNote :{type:String, required:false,maxLength:280},
        date_finished :{type:Date, required:false},
        date_started :{type:Date, required:false},
        date_paused:{type:Date, required:false},
        status:{type:Number, required:true}, // 0:wishlist 1:playing 2:finished 3:paused 
        favoris:{type:Boolean, default:false},
    }],required:false},
    createdAt: { type: Date, default: Date.now },
    mainLanguage:{type:String, required:false},
    lists:{type:[mongoose.Types.ObjectId], required:false},
    googleId:{type:String, required:false},
    googlePic:{type:String, required:false}
    // secret:{type:String, required:false},


})

userSchema.plugin(uniqueValidator);
// userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports=mongoose.model('User',userSchema)