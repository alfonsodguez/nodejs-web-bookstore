const httpError       = require('http-errors');
const { MulterError } = require('multer');
const { URL }         = require('../models/enums');
const { SessionNotFoundError, DataNotFoundError } = require('../errors/custom')

/**
 * ErrorHandler middleware
 */
module.exports = (app) => {       
    app.use(function(err, req, res, next) {
      console.log("Middleware: Error Handling")

      if (res.headersSent) {
        return next(err)
      } 
        
      if (err instanceof SessionNotFoundError) {
        res.redirect(URL.LOGIN)
      } else if (err instanceof DataNotFoundError) { 
        // TODO: redireccionar a una pagina de error
        res.status(err.status || 404).json({  
          name: err.name,
          message: err.message
        })
      } else if (err instanceof MulterError) {
        res.status(404).json({
          name: err.name,
          message: err.message,
          cause: err.code
        })
      } else {
        res.status(500).json({error: 'InternalServerError'})
      }
      next()
    })
}
