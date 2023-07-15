const { SessionNotFoundError } = require("../errors/custom")
const { ERROR_MESSAGE }        = require("../models/enums")

const checkSessionCliente = function(req, res, next) {  
      if (req.session.cliente == undefined || req.session.cliente == null || req.session.cliente == '') {
            throw new SessionNotFoundError(ERROR_MESSAGE.SESSION)
      } 
      
      req.cliente = req.session.cliente 
      next()      
}

module.exports = checkSessionCliente