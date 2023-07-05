const mongoose = require('mongoose')

const materiaSchema = new mongoose.Schema({
    idMateria:      { type: Number, required: true },
    idMateriaPadre: { type: Number, required: true },
    nombre:         { type: String, required: true }
}) 
module.exports = mongoose.model('Materia', materiaSchema, 'materias')
