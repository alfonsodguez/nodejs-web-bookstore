const express = require("express")
const multer = require('multer') 
const router = express.Router()
const RestController = require('../controllers/RESTController')

router.get('/getMunicipios/:codPro', RestController.getMunicipios) 
router.post('/uploadImagen', _upload.single('imagen'), RestController.uploadImagen)   // 'imagen' es el nombre de la variable a la cual pasas el fichero en la pet ajax en MiPerfil.hbs

const options = {
    destination: function (req, file, callback) { 
        const pathImgSubidas =  __dirname + '/../uploads/'
        
        callback(null, pathImgSubidas) 
    },
    filename: function (req, file, callback) {         
        const prefix = Date.now() + '-' + Math.round(Math.random() * 1E9)  
        const fileName = file.originalname.split('.')[0] + '-' + prefix + '.' + file.originalname.split('.')[1]
        
        callback(null, fileName)   
    }
}
const _upload = multer({ storage: multer.diskStorage(options) })

module.exports = router