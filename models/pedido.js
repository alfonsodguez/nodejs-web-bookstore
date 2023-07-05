const mongoose = require('mongoose')
const Libro = require('./libro')

const pedidoSchema = new mongoose.Schema({
    gastosEnvio: { type: Number, required: true, default: 0 },
    subtotal:    { type: Number, required: true, default: 0 },
    total:       { type: Number, required: true, default: 0 },
    estado:      { type: String, required: true, default: 'pendiente' },
    fecha:       { type: Date,   required: true, default: Date.now() },
    cliente:     { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
    articulos: [{
        libroItem:    { type: mongoose.Schema.Types.ObjectId, ref: 'Libro' },
        cantidadItem: { type: Number, required: true, default: 1 } 
    }]
}, { timestamps: true })


pedidosSchema.methods.CalcularTotalPedido = async function() {
    const articulosExpandidos = await Libro.populate(this.articulos, { path: 'libroItem' })

    const subtotal = articulosExpandidos.reduce((acc, itemPedido, index) => {
        return acc += itemPedido.cantidadItem * itemPedido.libroItem.precio
    }, 0)   
    
    this.subtotal = Math.round(subtotal * 100)/100
    this.total = Math.round((subtotal + this.gastosEnvio) * 100)/100
}

module.exports = mongoose.model('Pedido', pedidoSchema, 'pedidos')
