const fs = require('fs');
const restify = require('restify');
const os = require('os');

class GosApiFramework {

    constructor(config) {
        this.config = config;
    }

    /**
     * Bootstrap the server with the config
     */
    run() {
        const config = this.config;
        const http_options = {
            app: config.app.name,
            version: config.app.version
        };
        const log = require('./lib/log')(config);

        // config for ssl
        if (config.ssl) {
            http_options.key = fs.readFileSync(config.certs.key);
            http_options.certificate = fs.readFileSync(config.certs.certificate);
        }

        // create http server base on above options
        const app = restify.createServer(http_options);

        // catch the EADDRINUSE error
        app.on('error', function(err) {
            if (err.errno === 'EADDRINUSE') {
                log.error('Port already in use.');
                process.exit(1);
            } else {
                log.log(err);
            }
        });

        app.listen(config.http.port, function() {
            console.log(`App started on ${config.http.host}:${config.http.port} with ssl=${config.http.ssl}`);
            console.log('OS: ' + os.platform() + ', ' + os.release());
        });

        require('./restify')(app, config, log);

        require('./bootstrap')(app, config, log);
    }
}

module.exports = {
    Framework: GosApiFramework,
    ApiValidator: require('./lib/api-validator')
};