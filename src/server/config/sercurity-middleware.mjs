
const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.status(401).send({error: 'unauthorized'});
    }
};

export {auth};
