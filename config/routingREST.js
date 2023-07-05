const express = require("express")
const multer = require('multer') 
const router = express.Router()
const restController = require('../controllers/rest')

router.get('/getMunicipios/:codPro', restController.getMunicipios) 
router.post('/uploadImagen', _upload.single('imagen'), restController.uploadImagen)   // 'imagen' es el nombre de la variable a la cual pasas el fichero en la pet ajax en MiPerfil.hbs

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