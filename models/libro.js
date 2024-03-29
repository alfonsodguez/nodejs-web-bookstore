const mongoose = require('mongoose')

const libroSchema = new mongoose.Schema({
    iSBN10: { type: Number, required: true },
    iSBN13: { type: Number, required: true },
    titulo: { type: String, required: true },
    autor:  { type: String, required: true },
    precio: { type: Number, required: true },
    editorial: { type: String, required: true },
    idMateria: { type: Number, require: true },
    paginas:   { type: String, required: true },
    ficheroImagen: { type: String, required: true },
    descripcion:   { type: String, required: false },
})
module.exports = mongoose.model('Libro', libroSchema, 'libros')