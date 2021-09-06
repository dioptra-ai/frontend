const jsonError = (err, req, res, next) => { // eslint-disable-line no-unused-vars

    if (res.statusCode === 200) {
        res.status(500);
    }

    res.json({
        error: err.message
    });
};

export default jsonError;
