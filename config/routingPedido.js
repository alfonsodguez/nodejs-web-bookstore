const express = require('express')
const router = express.Router()
const pedidoController = require('../controllers/pedido')

router.get('/AddLibroPedido/:id',       pedidoController.addLibroPedido)
router.get('/SumarCantidadPedido/:id',  pedidoController.sumarCantidadPedido)
router.get('/RestarCantidadPedido/:id', pedidoController.restarCantidadPedido)
router.get('/EliminarLibroPedido/:id',  pedidoController.eliminarLibroPedido)
router.get('/FinalizarPedido',          pedidoController.finalizarPedido)

module.exports = router