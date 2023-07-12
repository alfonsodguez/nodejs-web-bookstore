class BaseCustomError extends Error {
    constructor(message, cause) {
        super()
        this.cause = cause
        this.message = message
        this.name = 'BaseCustomError'
        this.status = 500
    }
}

class NotFoundError extends BaseCustomError {
    constructor(message, cause) {
        super()
        this.cause = cause
        this.message = message
        this.name = 'NotFound'
        this.status = 400
    }
}