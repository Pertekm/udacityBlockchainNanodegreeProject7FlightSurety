import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flightId, airline, timestamp, callback) {
        let self = this;
        let payload = {
            airline: airline, //self.airlines[0],
            flightId: flightId,
            timestamp: timestamp //Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flightId, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    buyInsurance(flightId, airline, timestamp, money, callback) {
        let self = this;
        let payload = {
            airline: airline, //self.airlines[0],
            flightId: flightId,
            timestamp: timestamp //Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .buyInsurance(payload.airline, payload.flightId, payload.timestamp)
            .send({ from: self.owner, value: money}, (error, result) => {
                callback(error, payload);
            });
    }
}