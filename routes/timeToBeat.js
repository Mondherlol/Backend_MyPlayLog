const express = require('express')

const router = express.Router()

const htlbController = require('../controllers/hltbController.js')

router.get('/:gameName', htlbController.getTimesByName);


module.exports = router

