const express        = require("express")
const router         = express.Router()
const restController = require('../controllers/rest')
const errHandler     = require('../lib/error-handler')
const upload         = require('../middlewares/multer')

router.get('/getMunicipios/:codPro', errHandler(restController.getMunicipios)) 
router.post('/uploadImagen',         errHandler(upload.single('imagen')), restController.uploadImagen)   // 'imagen' es el nombre de la variable que asignamos al fichero al realizar la pet ajax en '../public/js/subirAvatar'

module.exports = router