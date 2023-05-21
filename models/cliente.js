const mongoose = require('mongoose')
                                            
const clienteSchema = new mongoose.Schema({ 
    nombre:    { type: String, required: true },
    apellidos: { type: String, required: true },
    nif:       { type: String, required: true, default: '0000000-1' },
    telefono:  { type: String, required: true, default: '666 66 66 66' },
    cuentaActiva: { type: Boolean, default: false },
    imagenAvatar: { type: String,  default: '' },       
    credenciales: { type: mongoose.Schema.Types.ObjectId, ref: "Credenciales" },
    direccion:        [ { type: mongoose.Schema.Types.ObjectId, ref: "Direccion" } ],
    historicoPedidos: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' } ],
})
module.exports = mongoose.model('Cliente', clienteSchema, 'clientes')
