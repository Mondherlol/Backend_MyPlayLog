const express = require('express')
const router = express.Router()

const listController = require('../controllers/listController.js')


//Get All Lists
router.get('/',listController.getAllLists);
//Get All lists with info if Game is in or not
router.get('/withGame/:gameId',listController.getAllListsWithGame);
//Get List of a User
router.get('/user/:idOwner',listController.getAllListsFromuser);
//Get List by Id
router.get('/:id',listController.getListById);


//Create List
router.post('/', listController.createList);
//Add Game to List
router.post('/game', listController.addGameToList);


//Like List
router.post('/like/:id', listController.likeListById)
//Unlike List
router.delete('/like/:id', listController.unlikeListById)



//Remove game from many Lists
router.delete('/remove/:id_IGDB',listController.removeGameFromLists);
//Delete List by Id
router.delete('/:id',listController.deleteListById);
//Remove game from List
router.delete('/:id/:id_IGDB',listController.removeGameFromList);

//Update List
router.put('/:id',listController.updateList);






module.exports = router
