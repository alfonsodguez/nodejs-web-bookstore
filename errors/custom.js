class BaseCustomError extends Error {
    constructor(message, cause) {
        super()
        this.cause = cause
        this.message = message
        this.name = 'BaseCustomError'
        this.status = 500
    }
}

class SessionNotFoundError extends BaseCustomError {
    constructor(message, cause) {
        super()
        this.cause = cause
        this.message = message
        this.name = 'SessionNotFoundError'
        this.status = 404
    }
}

class DataNotFoundError extends BaseCustomError {
    constructor(message, cause) {
        super()
        this.cause = cause
        this.message = message
        this.name = 'DataNotFoundError',
        this.status = 404
    }
}

class InvalidPasswordError extends BaseCustomError {
    constructor(message, cause) {
        super()
        this.cause = cause,
        this.message = message
        this.name = 'InvalidPasswordError'
        this.status = 400
    }
}

class CuentaInactivaError extends BaseCustomError {
    constructor(message, opcion) {
        super()
        this.opcion = opcion,
        this.message = message
        this.name = 'CuentaInactivaError'
        this.status = 400
    }
}

module.exports = {
    SessionNotFoundError,
    DataNotFoundError,
    InvalidPasswordError,
    CuentaInactivaError,
}