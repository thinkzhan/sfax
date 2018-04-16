const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/iframe-proxy/proxy.js',
    name: 'sfax_iframe-proxy',
    output: {
        file: 'dist/iframe-proxy.js',
        format: 'umd'
    },
    plugins: [
        uglify({
            // mangle: false,
            ie8: true
        })
    ]
};
