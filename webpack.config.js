const glob = require('glob');
const webpackBuilder = require('dev/webpack/builder');

module.exports = webpackBuilder(__dirname)
    .forDevelopment('mask', builder => builder
        .addEntry('demo', './demo/main.ts')
        .addEntry('test', glob.sync('./src/**/*.test.ts'))
        .setOutput('bundle-[name].js', '/out')
        .addTypeScript()
        .addHtml()
    )
    .build();
