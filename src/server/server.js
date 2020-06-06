import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// ToDo: Oracle Initialization
//       Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory
//       use flightSuretyApp.registerOracle

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    console.log("OracleRequest: ")
    if (error) console.log("error: " + error)
    console.log(event)

    // ToDo Logik: Update State, Oracle Answer (flight is late or not) by push transaction to flight contract
    
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
    // possible endpoint for persisting flights (for flight dropdown in ui), not needed for requirements
})

export default app;


