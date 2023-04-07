
let hltb = require('howlongtobeat');
let hltbService = new hltb.HowLongToBeatService();



const axios = require('axios')



exports.getTimesByName = (req,res,next)=>{
    const gameName = req.params.gameName;
    hltbService.search(gameName).then(result =>{
        res.status(200).json(result)
    })
    .catch((err) => {
        res.send(err)
      })    
}