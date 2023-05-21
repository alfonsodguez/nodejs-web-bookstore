const logger = require('winston')
const Municipios = require('../models/municipio')

module.exports = {
    getMunicipios: async (req, res) => {
        try {
            const codPro = req.params.codPro
            const municipios = await Municipios.find({ codPro: codPro }).lean()

            res.status(200).json(municipios)
        } catch (err) {
            logger.error('Error al recuperar los municipios', err)
        }
    },
    uploadImagen: (req, res) => {
        /**
         * usamos el middleware "multer" para procesar el contenido multipart/form-data
         * que va en el req.file
         */
        res.status(200).send({codigo: 0, mensaje: 'imagen avatar subida correctamente'}) 
    }
} 
