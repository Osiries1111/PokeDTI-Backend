const { ErrorHandler } = require('./errorHandler');

class Middleware {
    errorHandler(err, req, res, next){
        ErrorHandler.errorHandler(err, req, res, next);
    }
}

module.exports = Middleware;