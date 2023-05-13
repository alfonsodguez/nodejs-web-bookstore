const express = require('express')
const router = express.Router() 
const TiendaController = require('../controllers/tiendaController')

router.get('/Libros/:idmateria?', TiendaController.getLibros)
router.get('/MostrarLibro/:id', TiendaController.getMostrarLibro)

module.exports = router
