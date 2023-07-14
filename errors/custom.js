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

module.exports = {
    SessionNotFoundError,
    DataNotFoundError
}