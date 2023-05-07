const mongoose = require('mongoose');

const materiasSchema = new mongoose.Schema({
    idMateria: { type: Number, required: true },
    idMateriaPadre: { type: Number, required: true },
    nombreMateria:  { type: String, required: true }
}); 
module.exports = mongoose.model('Materias', materiasSchema, 'materias')
