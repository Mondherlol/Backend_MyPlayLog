const express = require('express')
const router = express.Router()

const gamesController = require('../controllers/gamesController.js')

//new search test
router.get('/searchs',gamesController.searchGames);
router.get('/search',gamesController.searchAll);
router.get('/search/:name', gamesController.searchGame);

router.get('/search/light/:name', gamesController.searchLight)

router.get('/game/:slug', gamesController.getGameBySlug);



module.exports = router
