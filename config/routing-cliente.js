const express                    = require('express')
const router                     = express.Router()  
const clienteController          = require('../controllers/cliente')
const { URL }                    = require('../models/enums')
const errHandler                 = require('../lib/error-handler')
const checkSessionCliente        = require('../middlewares/check-session')
const cargarOpcionesPanelCliente = require('../middlewares/opciones-panel')

router.route('/Registro')
      .get(errHandler(clienteController.getRegistro))
      .post(errHandler(clienteController.postRegistro))

router.route('/Login')
      .get(errHandler(clienteController.getLogin))
      .post(errHandler(clienteController.postLogin)) 

router.get("/ActivarCuenta", errHandler(clienteController.getActivarCuenta))

router.route('/ForgotPassword')
      .get(errHandler(clienteController.getForgotPassword))
      .post(errHandler(clienteController.postForgotPassword))

router.route('/CambioPassword')
      .get(errHandler(clienteController.getCambioPassword))
      .post(errHandler(clienteController.postCambioPassword))

router.all("/Panel/*", checkSessionCliente, cargarOpcionesPanelCliente) 
router.get("/Panel/PanelInicio", errHandler(clienteController.getPanelInicio))                                                                    
router.route('/Panel/MiPerfil')
      .get(errHandler(clienteController.getMiPerfil))
      .post(errHandler(clienteController.postMiPerfil))

module.exports = router