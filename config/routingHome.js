const express = require('express')
const router = express.Router()
const {URL} = require('../models/enums')

router.get("/", getHome)

function getHome(req, res) {
    res.status(200).redirect(URL.TIENDA)
}

module.exports = router