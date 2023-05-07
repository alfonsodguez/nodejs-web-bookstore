const mongoose = require('mongoose');

const municipiosSchema = new mongoose.Schema({
    codPro: { type: Number, required: true },
    codMun: { type: Number, required: true },
    nombreMunicipio: { type:String, required: true }
});
module.exports = mongoose.model('Municipios',municipiosSchema,'municipios');