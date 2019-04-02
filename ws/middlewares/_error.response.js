function errorResponse(err, req, res, next) {
    console.error(err);
    if (res.headersSent) { return next(err); }
    res.status(500);
    res.send({error: err.message});
}

module.exports = errorResponse;