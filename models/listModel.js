const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
  idOwner: { type: String, required: true },
  idCollaborators: [
    { type: [mongoose.Types.ObjectId], required: false }
  ],
  name: { type: String, required: true, maxLength:100 },
  description: { type: String, required: false, maxLength: 300 },
  ranked: { type:Boolean, required:true, default:false},
  public: { type: Boolean, required: true },
  games: { type: [{
    id_IGDB: { type: Number, required: true },
    rank: { type: Number, required:false},
    annotation: {type:String, required:false, maxLength: 250},
    addedAt : {type:Date, default:Date.now}
  }]},
  tags:{ type: [{
    tag: { type: String, required: false, maxLength:20 },
  }]},
  createdAt: { type: Date, default: Date.now },
  lastUpdate: {type:Date , default:Date.now},
  views : {type:Number, default:0},
  likes : {
    type:[{
      idUser: {type:String, required:true}
    }],
    default: []
  },
  likesCount: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('List', listSchema );