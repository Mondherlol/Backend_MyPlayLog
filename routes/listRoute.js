const express = require('express')
const router = express.Router()

const listController = require('../controllers/listController.js')

const loggedIn=(req, res, next) =>{
    if (req.user) {
        next();
    }
    else {
      res.status(400).json({message: "Not logged"})
    }
}



//Get All Lists
router.get("/",listController.getAllLists);
//Get All lists with info if Game is in or not
router.get('/withGame/:gameId',loggedIn, listController.getAllListsWithGame);
//Get List of a User
router.get('/user/:idOwner',listController.getAllListsFromuser);
//Get List by Id
router.get('/:id',listController.getListById);


//Create List
router.post('/', loggedIn, listController.createList);

//Add Game to List
router.post('/game', loggedIn,listController.checManyListsOwnerships,listController.addGameToList);


//Like List
router.post('/like/:id', loggedIn,listController.likeListById)
//Unlike List
router.delete('/like/:id',loggedIn, listController.unlikeListById)



//Remove game from many Lists
router.delete('/remove/:id_IGDB',loggedIn,listController.removeGameFromLists);
//Delete List by Id
router.delete('/:id',loggedIn,listController.checkListOwnership,listController.deleteListById);
//Remove game from List
router.delete('/:id/:id_IGDB',loggedIn,listController.checkListOwnership,listController.removeGameFromList);

//Update List
router.put('/:id',loggedIn,listController.checkListOwnership,listController.updateList);






module.exports = router
