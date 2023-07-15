const express             = require('express')
const router              = express.Router()  
const clienteController   = require('../controllers/cliente')
const { URL }             = require('../models/enums')
const errHandler          = require('../lib/error-handler')
const checkSessionCliente = require('../middlewares/check-session')

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

router.all("/Panel/*", checkSessionCliente, _cargarOpcionesPanelCliente) 
router.get("/Panel/PanelInicio", errHandler(clienteController.getPanelInicio))                                                                    
router.route('/Panel/MiPerfil')
      .get(errHandler(clienteController.getMiPerfil))
      .post(errHandler(clienteController.postMiPerfil))

function _cargarOpcionesPanelCliente(req, res, next) { 
      const listaOpcionesPanel = [
            "Inicio:PanelInicio", 
            "Mi Perfil:MiPerfil",
            "Mis Datos de Envio:MisDatosEnvio",
            "Mis Gustos:MisGustos", 
            "Mis Opiniones:MisOpiniones",
            "Mi Lista de Deseios:MiListaDeseos",
            "Volver a Agapea:Inicio",
            "Desconectarse:Logout"
      ] 
      req.opcionesPanelPerfil = listaOpcionesPanel 
      next()
}

module.exports = router