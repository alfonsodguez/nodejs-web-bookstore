const mongoose = require('mongoose')
const Libro = require('../models/libro')

const pedidosSchema = new mongoose.Schema({
    gastosEnvio:    { type: Number, required: true, default: 0 },
    subTotalPedido: { type: Number, required: true, default: 0 },
    totalPedido:    { type: Number, required: true, default: 0 },
    estadoPedido:   { type: String, required: true, default: 'pendiente' },
    fechaPedido:    { type: Date,   required: true, default: Date.now },
    clientePedido:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
    elementosPedido: [{
        libroItem:    { type: mongoose.Schema.Types.ObjectId, ref: 'Libro' },
        cantidadItem: { type: Number, required: true, default: 1 } 
    }]
})
module.exports = mongoose.model('Pedido', pedidosSchema, 'pedidos')

pedidosSchema.methods.CalcularTotalPedido = async function() {
    const elemPedidoExpanded = await Libro.populate(this.elementosPedido, { path: 'libroItem' })

    const subtotal = 0
    elemPedidoExpanded.forEach((itemPedido) => {
        subtotal += itemPedido.cantidadItem * itemPedido.libroItem.precio
    })

    this.subTotalPedido = Math.round(subtotal * 100)/100
    this.totalPedido = Math.round((subtotal + this.gastosEnvio) * 100)/100
}

