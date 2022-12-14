const reportLogger = require('./reportLogger');

class SoftAssert {

    constructor(testContext) {
        this.testContext = testContext;
        this.assertCount = 0;
        this.isPassed = true;
        this.assertions = [];
        this.scenarios = [];
        this.scenario;
        this.scrAssertionsCounter = 0;
        this.scenarioCounter = 0;

    }

    setScenario(scr) {
        this.scenarioCounter++;
        this.scrAssertionsCounter = 0
        this.scenario = scr;
    }

    async assert(expectCallBack) {
        this.scrAssertionsCounter++;
        this.assertCount++;
        try {
            await expectCallBack();
            this.scenarios.push(`${this.scenarioCounter}.${this.scrAssertionsCounter}  PASSED:  ${this.scenario}`);
            reportLogger.AddMessage(`************* ${this.scenarioCounter}.${this.scrAssertionsCounter}  PASSED:  ${this.scenario}`);

        } catch (assertError) {
            this.scenarios.push(`${this.scenarioCounter}.${this.scrAssertionsCounter}  FAILED **:   ${this.scenario}`);
            this.isPassed = false;
            this.assertions.push(`${this.scenarioCounter}.${this.scrAssertionsCounter} : ${assertError.message}`);
            reportLogger.AddMessage(`************* ${this.scenarioCounter}.${this.scrAssertionsCounter}  FAILED **:   ${this.scenario}`);
            await reportLogger.AddScreenshot();

        }
    }

    finally() {
        let scrs = " \n \n All Scenarios: \n";
        for (const scr of this.scenarios) {
            scrs = `${scrs} \n ${scr}`;
        }

        if (!this.isPassed) {
            let errors = "\n";
            let errCounter = 0;
            for (const error of this.assertions) {
                errCounter++;
                errors = `${errors} \n  ${error}`;
            }

            let scrs = errors + " \n \n All Scenarios: \n";
            for (const scr of this.scenarios) {
                scrs = `${scrs} \n ${scr}`;
            }
            errors = errors + "\n\n";
            expect(false, `${this.assertions.length} of ${this.assertCount} assertions failed => Error(s) :` + scrs).to.be.true

        }
    }


}

module.exports = SoftAssert;

