const cargarOpcionesPanelCliente = function(req, res, next) { 
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

module.exports = cargarOpcionesPanelCliente