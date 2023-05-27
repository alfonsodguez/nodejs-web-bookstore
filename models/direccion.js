const mongoose = require('mongoose')

const direccionSchema = new mongoose.Schema({
    calle: { type: String, required: true },
    cp:    { type: Number, required: true },
    esPrincipal: { type: Boolean, required: true, default:false },
    provincia:   { type: mongoose.Schema.Types.ObjectId, ref:'Provincias' },
    municipio:   { type: mongoose.Schema.Types.ObjectId, ref: 'Municipios' },
    clienteId:   { type: mongoose.Schema.Types.ObjectId, ref:'Cliente' }
})
module.exports = mongoose.model('Direccion', direccionSchema, 'direcciones')
