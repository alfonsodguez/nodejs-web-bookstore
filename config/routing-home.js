const express = require('express')
const router  = express.Router()
const {URL}   = require('../models/enums')

router.get("/", getHome)

function getHome(req, res) {
    res.redirect(URL.TIENDA)
}

module.exports = router