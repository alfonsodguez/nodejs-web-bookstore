const mongoose = require('mongoose')

const provinciaSchema = new mongoose.Schema({
    codPro: { type: Number, required: true }, 
    nombreProvincia: { type: String, required: true }        
})
module.exports = mongoose.model('Provincias', provinciaSchema, 'provincias')