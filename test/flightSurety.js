
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`first airline is registered automatic`, async function () {

    let result = await config.flightSuretyApp.isAirline.call(config.firstAirline);

    // ASSERT
    assert.equal(result, true, "Airline should be registered");
  });

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    }
    catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    }
    catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSuretyData.pay(); // Any function with requireIsOperational  //setTestingMode(true);
    }
    catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work (alternative use before function)
    await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
    }
    catch (e) {
      assert.isTrue(true, "revert exception required");
    }
    let result = await config.flightSuretyApp.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });


  it('(owner) can register an Airline using registerAirline()', async () => {

    // ARRANGE
    let newAirline = accounts[3];

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline, { from: config.owner });
    let result = await config.flightSuretyApp.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, true, "Owner should be able to register another airline");

  });

  it('(passenger) can buy insurance using buyInsurance()', async () => {

    // ARRANGE
    let airline = config.flightSample.airline;
    let flightId = config.flightSample.flightId;
    let timestamp = config.flightSample.timestamp;
    let passenger = accounts[4];
    let minMoney = 2;

    // ACT
    await config.flightSuretyApp.buyInsurance(airline, flightId, timestamp, { from: passenger, value: minMoney });

    // ASSERT
    assert.equal(true, true, "bla bla");

  });

  it('(passenger) can not buy insurance using buyInsurance() if too little money', async () => {

    // ARRANGE
    let airline = config.flightSample.airline;
    let flightId = config.flightSample.flightId;
    let timestamp = config.flightSample.timestamp;
    let passenger = accounts[4];
    let tooLittleMoney = 1;

    // ACT
    try {
      await config.flightSuretyApp.buyInsurance(airline, flightId, timestamp, { from: passenger, value: tooLittleMoney });
      
      assert.equal(true, false, "Should not reach here because exception is expected");
    }
    catch (e) {
      // ASSERT
      assert.equal(e.reason, "Not enough money given", "expect exception because of money needed");
    }

  });

});
