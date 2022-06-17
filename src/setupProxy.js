const { createProxyMiddleware } = require('http-proxy-middleware');

//https://stackoverflow.com/questions/48375966/dynamic-port-in-http-proxy-middleware-route-path-rewrite

module.exports = function (app) {
    app.use(
        '/emu',
        createProxyMiddleware({
            target: 'http://localhost',
            changeOrigin: true,
            pathRewrite:
                function (path, req) {
                    //Get the port number
                    var newPort = req.originalUrl.split('/')[2];
                    //Return the path with the api and portname removed
                    return path.replace('/emu/' + newPort, '');
                },
            router: function (req) {
                var newPort = req.originalUrl.split('/')[2];
                //Dynamically update the port number to the target in router
                return 'http://localhost:' + newPort;
            }
        })
    );
};