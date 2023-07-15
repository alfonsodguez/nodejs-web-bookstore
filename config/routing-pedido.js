const express          = require('express')
const router           = express.Router()
const pedidoController = require('../controllers/pedido')
const errHandler       = require('../lib/error-handler')

router.get('/AddLibroPedido/:id',       errHandler(pedidoController.addLibroPedido))
router.get('/SumarCantidadPedido/:id',  errHandler(pedidoController.sumarCantidadPedido))
router.get('/RestarCantidadPedido/:id', errHandler(pedidoController.restarCantidadPedido))
router.get('/EliminarLibroPedido/:id',  errHandler(pedidoController.eliminarLibroPedido))
router.get('/FinalizarPedido',          errHandler(pedidoController.finalizarPedido))

module.exports = router