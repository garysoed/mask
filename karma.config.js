module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: [
      {pattern: "out/bundle-test.js", watched: true, included: true},
      {pattern: "out/bundle-test.js.map", watched: true, included: false},
    ],
    exclude: [
    ],
    preprocessors: {
    },
    plugins: [
      require("karma-jasmine"),
      require("karma-sourcemap-loader")
    ],
    port: 8888,
    reporters: ["dots"],
    singleRun: false
  });
};
