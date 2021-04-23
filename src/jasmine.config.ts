module.exports = function() {
    var reporters = require('jasmine-reporters');

    console.log(`Hint: Set jasmine reporters: TEST_REP=[JUNIT|TEAMCITY]`);

    if (process.env.TEST_REP === "JUNIT") {
        var junitReporter = new reporters.JUnitXmlReporter({
            savePath: __dirname,
            consolidateAll: true
        });
        jasmine.getEnv().clearReporters();
        jasmine.getEnv().addReporter(reporter);
    } else if (process.env.TEST_REP === "TEAMCITY") {
        var reporter = new reporters.TeamCityReporter({
            savePath: __dirname,
            consolidateAll: true
        });
        jasmine.getEnv().clearReporters();
        jasmine.getEnv().addReporter(reporter);
    }
};