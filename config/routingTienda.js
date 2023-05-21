const express = require('express')
const router = express.Router() 
const tiendaController = require('../controllers/tienda')

router.get('/Libros/:idmateria?', tiendaController.getLibros)
router.get('/MostrarLibro/:id',   tiendaController.getMostrarLibro)

module.exports = router
