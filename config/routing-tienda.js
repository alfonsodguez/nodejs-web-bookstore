const express          = require('express')
const router           = express.Router() 
const tiendaController = require('../controllers/tienda')
const errHandler       = require('../lib/error-handler')

router.get('/Libros/:idmateria?', errHandler(tiendaController.getLibros))
router.get('/MostrarLibro/:id',   errHandler(tiendaController.getMostrarLibro))

module.exports = router
