const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/index.js',
    name: 'sfetch',
    output: {
        file: 'dist/sfetch.js',
        format: 'umd'
    },
    plugins: [
        uglify({
            // mangle: false,
            ie8: true
        })
    ]
};
