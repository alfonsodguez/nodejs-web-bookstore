const mongoose = require('mongoose')

const provinciaSchema = new mongoose.Schema({
    codPro: { type: Number, required: true }, 
    nombre: { type: String, required: true }        
})
module.exports = mongoose.model('Provincia', provinciaSchema, 'provincias')
