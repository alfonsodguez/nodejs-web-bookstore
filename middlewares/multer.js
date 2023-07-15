const multer = require('multer')

/**
 * Middleware para procesar el contenido multipart/form-data
 */
const options = {
    destination: function (req, file, callback) { 
        const pathImgSubidas =  __dirname + '/../uploads/'
        
        callback(null, pathImgSubidas) 
    },
    filename: function (req, file, callback) {         
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9)  
        const fileName = file.originalname.split('.')[0] + '-' + suffix + '.' + file.originalname.split('.')[1]
        
        callback(null, fileName)   
    }
}

const upload = multer({ storage: multer.diskStorage(options) })

module.exports = upload