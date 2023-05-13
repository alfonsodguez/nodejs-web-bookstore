const mongoose = require('mongoose')

const direccionSchema = new mongoose.Schema({
    calle:{ type: String, required: true },
    cp:   { type: Number, required: true },
    esprincipal:{ type: Boolean, required: true, default:false },
    provincia:  { type: mongoose.Schema.Types.ObjectId, ref:'Provincias' },
    municipio:  { type: mongoose.Schema.Types.ObjectId, ref: 'Municipios' },
    clienteid:  { type: mongoose.Schema.Types.ObjectId, ref:'Cliente' }
})
module.exports = mongoose.model('Direccion', direccionSchema, 'direcciones')