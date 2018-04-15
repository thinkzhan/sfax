const fs = require('fs');
const path = require('path');

fs.writeFileSync(path.resolve(process.cwd(), `./dist/sfetch-proxy.html`),
    fs.readFileSync(path.resolve(process.cwd(), './src/iframe-proxy/proxy.html'), 'utf8').replace(
        '/* script placeholder */',
        fs.readFileSync(path.resolve(process.cwd(), './dist/iframe-proxy.js'), 'utf8')
    )
);
