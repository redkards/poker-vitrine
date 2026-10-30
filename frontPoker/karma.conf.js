// Karma : configuration par défaut d'Angular + navigateur sans interface pour `npm run test:ci`
// (--no-sandbox : nécessaire dans un conteneur ou une CI lancée en root).
module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage/front-poker"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["Chrome"],
    customLaunchers: {
      ChromeHeadlessCI: { base: "ChromeHeadless", flags: ["--no-sandbox"] },
    },
    restartOnFileChange: true,
  });
};
