const mongoose = require('mongoose')

const municipioSchema = new mongoose.Schema({
    codPro: { type: Number, required: true },
    codMun: { type: Number, required: true },
    nombre: { type: String, required: true }
})
module.exports = mongoose.model('Municipios',municipioSchema,'municipios')
