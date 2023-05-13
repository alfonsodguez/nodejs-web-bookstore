const express = require('express')
const router = express.Router()  
const ClienteController = require('../controllers/clienteController')

router.route('/Registro')
      .get(ClienteController.getRegistro)
      .post(ClienteController.postRegistro)

router.route('/Login')
      .get(ClienteController.getLogin)
      .post(ClienteController.postLogin) 

router.get("/ActivarCuenta/:email", ClienteController.activarCuentaget)

router.route('/CompruebaEmail')
      .get(ClienteController.comprobarEmailget)
      .post(ClienteController.comprobarEmailpost)

router.route('/CambioPassword')
      .get(ClienteController.cambioPasswordget)
      .post(ClienteController.cambioPasswordpost)

router.all("/Panel/*", _checkSessionCliente, _cargarOpcionesPanelCliente) 
router.get("/Panel/PanelInicio", ClienteController.panelInicio)                                                                    
router.route('/Panel/MiPerfil')
      .get(ClienteController.miPerfilget)
      .post(ClienteController.miPerfilpost)

function _checkSessionCliente(req, res, next){  
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
            "Inicio-PanelInicio", 
            "Mi Perfil-MiPerfil",
            "Mis Datos de Envio-MisDatosEnvio",
            "Mis Gustos-MisGustos", 
            "Mis Opiniones-MisOpiniones",
            "Mi Lista de Deseios-MiListaDeseos",
            "Volver a Agapea-Inicio",
            "Desconectarse-Logout"
      ] 
      req.opPanelCliente = listaOpcionesPanel 
      next()
}

module.exports = router