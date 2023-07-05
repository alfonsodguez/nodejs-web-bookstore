const logger = require('winston')
const Municipio = require('../models/municipio')

module.exports = {
    getMunicipios: async (req, res) => {
        try {
            const codProvincia = req.params.codPro
            const municipios = await Municipio.find({ codProvincia }).lean()

            res.status(200).json(municipios)
        } catch (err) {
            console.log('Error al recuperar los municipios', err)
            res.status(500).send()
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
