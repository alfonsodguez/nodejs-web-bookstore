const httpError = require('http-errors');
const {SessionNotFoundError} = require('../errors/custom')
const { URL } = require('../models/enums');

/**
 * ErrorHandler middleware
 */
module.exports = (app) => {   
    app.use(function(req, res, next) {
      next(httpError(404));
    })
    
    app.use(function(err, req, res, next) {
      console.log("Middleware Error Hadnling")

      if (res.headersSent) {
        return next(err)
      } 
        
      if (err instanceof SessionNotFoundError) {
        res.redirect(URL.LOGIN)
      } else {
        res.status(500).json({error: 'InternalServerError'})
      }
      next()
    })
}
