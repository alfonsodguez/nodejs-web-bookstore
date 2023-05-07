const mongoose = require('mongoose');

const credencialesSchema = new mongoose.Schema({
    login: { type: String, required: true },
    email: { type: String, required: true, },
    hashpassword: { type: String, required: true}
});
module.exports= mongoose.model('Credenciales', credencialesSchema, 'credenciales');