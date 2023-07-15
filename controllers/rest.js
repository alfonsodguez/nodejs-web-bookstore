const Municipio = require('../models/municipio')
const { ERROR_MESSAGE } = require('../models/enums')

module.exports = {
    getMunicipios: async (req, res) => {
        const codProvincia = req.params.codPro
        const municipios = await Municipio.find({ codProvincia }).lean()

        if (!municipios) {
            throw new Error(ERROR_MESSAGE.MUNICIPIOS)
        }

        res.status(200).json(municipios)
    },
    uploadImagen: (req, res) => {
        /**
         * usamos el middleware "multer" para procesar el contenido multipart/form-data
         * que va en el req.file
         */
        res.status(200).json({mensaje: 'Imagen avatar subida correctamente'}) 
    }
} 
