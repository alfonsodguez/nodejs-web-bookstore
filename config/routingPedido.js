const express = require('express')
const router = express.Router()
const PedidoController = require('../controllers/pedidoController')

router.get('/AddLibroPedido/:id', PedidoController.addLibroPedido)
router.get('/SumarCantidadPedido/:id', PedidoController.sumarCantidadPedido)
router.get('/RestarCantidadPedido/:id', PedidoController.restarCantidadPedido)
router.get('/EliminarLibroPedido/:id', PedidoController.eliminarLibroPedido)
router.get('/FinalizarPedido', PedidoController.finalizarPedido)

module.exports = router