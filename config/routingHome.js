const express = require('express')
const router = express.Router()

router.get("/", getHome)

const urlHome = 'http://localhost:3000/Tienda/Libros/0'

function getHome(req, res) {
    res.redirect(urlHome)
}

module.exports = router