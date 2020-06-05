pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    struct AirlineStatus {
        bool isRegistered;
        bool isFunded;
    }

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    mapping(address => AirlineStatus) airlineStatus;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() public {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner(address caller) {
        require(caller == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */

    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */

    function setOperatingStatus(bool mode, address caller) external requireContractOwner(caller) {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        address newAirlineAddress,
        address registererAddress
    ) external requireIsOperational {
        require(
            registererAddress == contractOwner ||
                airlineStatus[registererAddress].isFunded,
            "Fund required to register new Airline"
        );

        airlineStatus[newAirlineAddress].isRegistered = true;
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buyInsurance(
        address airline,
        string flightId,
        uint256 timestamp
    ) external payable requireIsOperational {
        require(msg.value > 1, "Not enough money given");
        require(this.isAirlineRegistered(airline), "Airline is not registered");
        require(
            this.isFlightRegistered(airline, flightId, timestamp),
            "Flight is not registered"
        );
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees() external requireIsOperational {}

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external requireIsOperational {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable requireIsOperational {}

    function getFlightKey(
        address airline,
        string flightId,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flightId, timestamp));
    }

    function authorizeCaller(address callerAddress) {
        // implementation not required for project. Needed to authorize flightSuretyApp, alternative to caller parameter at setOperatingStatus.
    }

    function isAirlineRegistered(address checkAddress) external view returns (bool) {
        return airlineStatus[checkAddress].isRegistered;
    }

    function registerFlight(
        address airline,
        string flightId,
        uint256 timestamp
    ) external {
        Flight memory flight;

        flight.isRegistered = true;
        flight.statusCode = 0; // for unknown (see app)
        flight.updatedTimestamp = 0; // not yet updated by oracle
        flight.airline = airline;

        bytes32 flightKey = getFlightKey(airline, flightId, timestamp);

        flights[flightKey] = flight;
    }

    function isFlightRegistered(
        address airline,
        string flightId,
        uint256 timestamp
    ) external view returns (bool) {
        bytes32 flightKey = getFlightKey(airline, flightId, timestamp);

        return flights[flightKey].isRegistered;
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
        fund();
    }
}
