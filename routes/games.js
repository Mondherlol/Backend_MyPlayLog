const express = require('express')
const router = express.Router()

const gamesController = require('../controllers/gamesController.js')


router.get('/search/light/:name', gamesController.searchLight)

router.get('/search',gamesController.searchGames);


router.get('/latest/', gamesController.latestGames)

router.get('/game/:slug', gamesController.getGameBySlug);



module.exports = router
