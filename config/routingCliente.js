const express = require('express')
const router = express.Router()  
const clienteController = require('../controllers/cliente')

router.route('/Registro')
      .get(clienteController.getRegistro)
      .post(clienteController.postRegistro)

router.route('/Login')
      .get(clienteController.getLogin)
      .post(clienteController.postLogin) 

router.get("/ActivarCuenta/:email", clienteController.getActivarCuenta)

router.route('/CompruebaEmail')
      .get(clienteController.getComprobarEmail)
      .post(clienteController.postComprobarEmail)

router.route('/CambioPassword')
      .get(clienteController.getCambioPassword)
      .post(clienteController.postCambioPassword)

router.all("/Panel/*", _checkSessionCliente, _cargarOpcionesPanelCliente) 
router.get("/Panel/PanelInicio", clienteController.getPanelInicio)                                                                    
router.route('/Panel/MiPerfil')
      .get(clienteController.getMiPerfil)
      .post(clienteController.postMiPerfil)

function _checkSessionCliente(req, res, next) {  
      if (req.session.cliente == undefined || req.session.cliente == null || req.session.cliente == '') {
            res.status(200).redirect('http://localhost:3000/Cliente/Login')
      }
      else { 
            req.cliente = req.session.cliente 
            next() 
      }
}

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