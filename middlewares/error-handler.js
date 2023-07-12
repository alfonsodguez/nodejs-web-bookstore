// TODO
var createError = require('http-errors');

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function errorHandler(err, req, res, next) {
    console.log("Middleware Error Hadnling");
    
    if (err instanceof NotFoundError) {
        res.status(err.status || 400).json({
            name: err.name,
            message: err.message,
        })
    } else {
        res.status(500).json({
            error: 'InternalServerError'
        })
    }
}

module.exports = {
    logErrors,
    errorHandler
}