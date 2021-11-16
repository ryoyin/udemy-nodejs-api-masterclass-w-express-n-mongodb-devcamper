const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (error, req, res, next) => {

    let err = { ...error }
    err.message = error.message

    console.log(error.stack.red)

    // return error by error name
    if(error.name === 'CastError') {
        const message = `Resource not found`
        err = new ErrorResponse(message, 404)
    }

    // return error by error code
    if(error.code === 11000) {
        const message = `Duplicate field value entered`
        err = new ErrorResponse(message, 404)
    }

    // mongoose validation error
    if(error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(val => val.message)
        err = new ErrorResponse(message, 404)
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    })

}

module.exports = errorHandler 