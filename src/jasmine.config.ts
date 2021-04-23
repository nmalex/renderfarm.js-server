module.exports = function() {
    var reporters = require('jasmine-reporters');

    console.log(`Hint: Set jasmine reporters: TEST_REP=[JUNIT|TEAMCITY]`);

    if (process.env.TEST_REP === "JUNIT") {
        var junitReporter = new reporters.JUnitXmlReporter({
            savePath: ".test-results",
            consolidateAll: true
        });
        jasmine.getEnv().clearReporters();
        jasmine.getEnv().addReporter(junitReporter);
    } else if (process.env.TEST_REP === "TEAMCITY") {
        var teamCityReporter = new reporters.TeamCityReporter({
            savePath: __dirname,
            consolidateAll: true
        });
        jasmine.getEnv().clearReporters();
        jasmine.getEnv().addReporter(teamCityReporter);
    }
};
