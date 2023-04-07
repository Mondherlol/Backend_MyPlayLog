const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema= mongoose.Schema({
    username:{type:String, required:true, maxLength:20,unique: true},
    email:{type:String, required:true,unique: true},
    password:{type:String, required:true},
    bio:{type:String, required:false, maxLength:128},
    profilePic:{type:String, required:true},
    coverPic:{type:String, required:false},
    private:{type:Boolean, required:true}, // public / private
    games:{type:[{
        id_IGDB :{type:Number, required:true},
        timePlayed :{type:Number, required:false},
        progressNote :{type:String, required:false,maxLength:280},
        date_finished :{type:Date, required:false},
        date_started :{type:Date, required:false},
        date_paused:{type:Date, required:false},
        status:{type:Number, required:true}, // 0:wishlist 1:playing 2:finished 3:paused 
        favoris:{type:Boolean, default:false},
    }]},
    listes:{type:[mongoose.Types.ObjectId], required:false},

})

userSchema.plugin(uniqueValidator);

module.exports=mongoose.model('User',userSchema)