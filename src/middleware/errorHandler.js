class ErrorHandler {

    // eslint-disable-next-line no-unused-vars
    static errorHandler(err, req, res, next){
        console.log(err.stack);
        res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = ErrorHandler;