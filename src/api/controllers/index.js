const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

// require all controllers and register its endpoints to "api/" base path
const importAll = function (app, basePath) {
    // eslint-disable-next-line no-sync
    fs.readdirSync(__dirname)
        .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
        .forEach((file) => {
            // eslint-disable-next-line global-require
            const route = require(path.join(__dirname, file.slice(0, -3)));

            app.use(basePath + file.slice(0, -3), route);
        });
};

module.exports = importAll;
