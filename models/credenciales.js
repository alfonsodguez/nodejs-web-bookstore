const mongoose = require('mongoose')

const credencialesSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email:    { type: String, required: true },
    hash:     { type: String, required: true }
}, { timestamps: true })

module.exports= mongoose.model('Credenciales', credencialesSchema, 'credenciales')