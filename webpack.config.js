const webpackBuilder = require('dev/webpack/builder');
const glob = require('glob');

module.exports = webpackBuilder(__dirname)
    .forDevelopment('main', builder => builder
        .addEntry('demo', './demo/main.ts')
        .addEntry('test', glob.sync('./src/**/*.test.ts'))
        .setOutput('bundle-[name].js', '/out')
        .addTypeScript()
        .addHtml(),
    )
    .forDevelopment('cli', builder => builder
        .addEntry('cli', './src/cli/theme.ts')
        .setOutput('cli-[name].js', '/out')
        .addTypeScript()
        .addHtml()
        .setAsNode(),
    )
    .build('main');
