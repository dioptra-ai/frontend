import {validationResult} from 'express-validator';

const validate = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const {location, msg, param, value} = result.errors[0];

        res.status(400);

        next(new Error(`${location}["${param}"]: ${msg} "${value}"`));
    } else {
        next();
    }
};

export default validate;
