
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async () => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: result }]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flightId = DOM.elid('flight-id-status').value;
            let airline = DOM.elid('airline-status').value;
            let timestamp = DOM.elid('timestamp-status').value;

            // Write transaction
            contract.fetchFlightStatus(flightId, airline, timestamp, (error, result) => {
                if (!error) {
                    display('Oracles', 'Trigger oracles', [{
                        label: 'Fetch Flight Status for flight ' + result.flightId + ', airline ' + result.airline + ', timestamp ' + result.timestamp,
                        value: 'Generated a request for oracles to fetch flight information'
                    }]);
                } else {
                    display('Oracles', 'Trigger oracles', [{
                        label: 'Fetch Flight Status for flight ' + result.flightId + ', airline ' + result.airline + ', timestamp ' + result.timestamp,
                        error: error
                    }]);
                }
            });
        })

        DOM.elid('airline-insurance').value = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'; //contract.airlines[0]; first airline, see file migrations\2_deploy_contracts.js

        DOM.elid('purchase-insurance').addEventListener('click', () => {
            let flightId = DOM.elid('flight-id-insurance').value;
            let airline = DOM.elid('airline-insurance').value;
            let timestamp = DOM.elid('timestamp-insurance').value;
            let money = DOM.elid('money-insurance').value;

            // Write transaction
            contract.buyInsurance(flightId, airline, timestamp, money, (error, result) => {
                if (!error) {
                    display('Surety', 'Purchased insurance', [{
                        label: 'Purchased insurance for flight ' + result.flightId + ', airline ' + result.airline + ', timestamp ' + result.timestamp,
                        value: 'successfull'
                    }]);
                } else {
                    display('Surety', 'Purchase insurance', [{
                        label: 'Purchase insurance for flight ' + result.flightId + ', airline ' + result.airline + ', timestamp ' + result.timestamp,
                        error: error
                    }]);
                }
            });
        })

    });


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-6 field' }, result.label));
        if (!result.error) {
            row.appendChild(DOM.div({ className: 'col-sm-6 field-value' }, String(result.value)));
        } else {
            row.appendChild(DOM.div({ className: 'col-sm-6 field-value error' }, String(result.error)));
        }
        section.appendChild(row);
    })
    displayDiv.append(section);

}







