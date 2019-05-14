const glob = require('glob');
const WebpackBuilder = require('dev/webpack/builder');

module.exports = (new WebpackBuilder(__dirname))
    .addEntry('demo', './demo/demo.ts')
    .addEntry('test', glob.sync('./src/**/*.test.ts'))
    .setOutput('bundle-[name].js', '/out')
    .addTypeScript()
    .addHtml()
    .buildForDevelopment('Mask');
