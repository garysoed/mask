const webpackBuilder = require('dev/webpack/builder');
const glob = require('glob');

module.exports = webpackBuilder(__dirname)
    .forDevelopment('main', builder => builder
        .addEntry('demo', './demo/main.ts')
        .addEntry('test', glob.sync('./src-next/**/*.test.ts'))
        .setOutput('bundle-[name].js', '/out')
        .addTypeScript()
        .addHtml(),
    )
    .forDevelopment('node', builder => builder
        .addEntry('cli', './src/cli-next/theme.ts')
        .setOutput('cli-[name].js', '/out')
        .addTypeScript()
        .addHtml()
        .setAsNode(),
    )
    .build('main');
