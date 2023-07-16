const httpError            = require('http-errors');
const { MulterError }      = require('multer');
const { URL, RENDER_PATH } = require('../models/enums');
const { SessionNotFoundError, DataNotFoundError, InvalidPasswordError, CuentaInactivaError, InvalidEmailError } = require('../errors/custom')

/**
 * Error handling middleware
 */
module.exports = (app) => {       
    app.use(function(err, req, res, next) {

      if (res.headersSent) {
        return next(err)
      } 
        
      if (err instanceof SessionNotFoundError) {
        res.redirect(URL.LOGIN)
      } else if (err instanceof InvalidPasswordError) {
        res.status(err.status || 400).render(RENDER_PATH.LOGIN, { layout: null, mensajeError: err.message })
      } else if (err instanceof InvalidEmailError) { 
        res.status(err.status || 400).render(RENDER_PATH.FORGOT_PASSWORD, { layout: null, mensajeError: err.message })
      } else if (err instanceof CuentaInactivaError) { 
        const url = URL.ACTIVAR_CUENTA + err.option 
        res.redirect(url)
      } else if (err instanceof DataNotFoundError) { 
        // TODO: redireccionar a una pagina de error
        res.status(err.status || 404).json({ name: err.name, message: err.message })
      } else if (err instanceof MulterError) {
        res.status(404).json({ name: err.name, message: err.message, cause: err.code })
      } else {
        res.status(500).json({error: 'InternalServerError'})
      }
      next()
    })
}
