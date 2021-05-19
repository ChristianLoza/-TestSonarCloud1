var { defineSupportCode } = require('cucumber');

const MockApp = require('../nodeMock/app');

// const browserUtil = require('../../util/browserUtil');
// const nodeAppMockData = require('../../../nodeMock/nodeApp/mockData');
const CucumberReporter = require('../support/reportLogger');
const dateTimePickerComponent = require('../pageObjects/dateTimePicker');


defineSupportCode(function ({ And, But, Given, Then, When }) {

    When('I validate datetime field values in case edit page', async function (fielValuesDT) {
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldVal = await dateTimePickerComponent.getFieldValue(fieldValues[i].cssSelector, null)
            expect(fieldVal).to.equal(fieldValues[i].value)
        }

    });

    Then('I validate date time readonly field', async function (fielValuesDT){
        const fieldValues = fielValuesDT.hashes();
        for (let i = 0; i < fieldValues.length; i++) {
            const fieldVal = await dateTimePickerComponent.getReadonlyFieldValue(fieldValues[i].label, null)
            expect(fieldVal).to.equal(fieldValues[i].value)
        }


   }); 


});
