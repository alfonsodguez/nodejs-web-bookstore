const mongoose = require('mongoose')

const municipioSchema = new mongoose.Schema({
    codProvincia: { type: Number, required: true },
    codMunicipio: { type: Number, required: true },
    nombre:       { type: String, required: true }
})
module.exports = mongoose.model('Municipio', municipioSchema, 'municipios')
