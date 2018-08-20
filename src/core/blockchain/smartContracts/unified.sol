
pragma solidity ^0.4.24;

// File: node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;


    event OwnershipRenounced(address indexed previousOwner);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );


    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipRenounced(owner);
        owner = address(0);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param _newOwner The address to transfer ownership to.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        _transferOwnership(_newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param _newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address _newOwner) internal {
        require(_newOwner != address(0));
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}

// File: contracts/Oracle/PumaPayOracle.sol

contract PumaPayOracle is Ownable {
    /// =================================================================================================================
    ///                                      Events
    /// =================================================================================================================
    event LogSetExchangeRate(string currency, uint256 exchangeRate);

    /// =================================================================================================================
    ///                                      Members
    /// =================================================================================================================
    mapping (string => uint256) private exchangeRates;

    /// =================================================================================================================
    ///                                      Constructor
    /// =================================================================================================================
    constructor() public {
    }

    /// =================================================================================================================
    ///                                      Public Functions
    /// =================================================================================================================

    function setRate(string _currency, uint256 _rate)
    public
    onlyOwner
    returns (bool) {
        exchangeRates[_currency] = _rate;
        emit LogSetExchangeRate(_currency, _rate);

        return true;
    }

    function getRate(string _currency) public view returns(uint256) {
        return exchangeRates[_currency];
    }
}

// File: node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

// File: node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

// File: node_modules/openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic {
    using SafeMath for uint256;

    mapping(address => uint256) balances;

    uint256 totalSupply_;

    /**
    * @dev total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @dev transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param _owner The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

}

// File: node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender)
    public view returns (uint256);

    function transferFrom(address from, address to, uint256 value)
    public returns (bool);

    function approve(address spender, uint256 value) public returns (bool);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

// File: node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {

    mapping (address => mapping (address => uint256)) internal allowed;


    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
    public
    returns (bool)
    {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     *
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(
        address _owner,
        address _spender
    )
    public
    view
    returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseApproval(
        address _spender,
        uint _addedValue
    )
    public
    returns (bool)
    {
        allowed[msg.sender][_spender] = (
        allowed[msg.sender][_spender].add(_addedValue));
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     *
     * approve should be called when allowed[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseApproval(
        address _spender,
        uint _subtractedValue
    )
    public
    returns (bool)
    {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}

// File: node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol

/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/openzeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
contract MintableToken is StandardToken, Ownable {
    event Mint(address indexed to, uint256 amount);
    event MintFinished();

    bool public mintingFinished = false;


    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    modifier hasMintPermission() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(
        address _to,
        uint256 _amount
    )
    hasMintPermission
    canMint
    public
    returns (bool)
    {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
     * @dev Function to stop minting new tokens.
     * @return True if the operation was successful.
     */
    function finishMinting() onlyOwner canMint public returns (bool) {
        mintingFinished = true;
        emit MintFinished();
        return true;
    }
}

// File: contracts/PumaPayToken.sol

/// PumaPayToken inherits from MintableToken, which in turn inherits from StandardToken.
/// Super is used to bypass the original function signature and include the whenNotMinting modifier.
contract PumaPayToken is MintableToken {

    string public name = "PumaPay";
    string public symbol = "PMA";
    uint8 public decimals = 18;

    constructor() public {
    }

    /// This modifier will be used to disable all ERC20 functionalities during the minting process.
    modifier whenNotMinting() {
        require(mintingFinished);
        _;
    }

    /// @dev transfer token for a specified address
    /// @param _to address The address to transfer to.
    /// @param _value uint256 The amount to be transferred.
    /// @return success bool Calling super.transfer and returns true if successful.
    function transfer(address _to, uint256 _value) public whenNotMinting returns (bool) {
        return super.transfer(_to, _value);
    }

    /// @dev Transfer tokens from one address to another.
    /// @param _from address The address which you want to send tokens from.
    /// @param _to address The address which you want to transfer to.
    /// @param _value uint256 the amount of tokens to be transferred.
    /// @return success bool Calling super.transferFrom and returns true if successful.
    function transferFrom(address _from, address _to, uint256 _value) public whenNotMinting returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }
}

// File: contracts/PullPayment/Factory.sol

/// @title Factory - Factory contract which deploys new contracts to the blockchain
/// @author PumaPay Dev Team - <developers@pumapay.io>
contract Factory {

    /// =================================================================================================================
    ///                                      Events
    /// =================================================================================================================
    event LogPullPaymentContractInstantiation(address sender, address instantiation);

    /// =================================================================================================================
    ///                                      Members
    /// =================================================================================================================
    mapping(address => bool) public isInstantiation;
    mapping(address => address[]) public instantiations;

    /// =================================================================================================================
    ///                                      Public Functions
    /// =================================================================================================================

    /// @dev Returns number of instantiations by creator.
    /// @param creator Contract creator.
    /// @return Returns number of instantiations by creator.
    function getInstantiationCount(address creator)
    public
    view
    returns (uint)
    {
        return instantiations[creator].length;
    }

    /// @dev Returns all the instantiations by creator.
    /// @param creator Contract creator.
    /// @return Returns all the instantiations by creator.
    function getAllInstantiations(address creator)
    public
    view
    returns (address[])
    {
        return instantiations[creator];
    }

    /// =================================================================================================================
    ///                                      Internal Functions
    /// =================================================================================================================

    /// @dev Registers contract in factory registry.
    /// @param instantiation Address of contract instantiation.
    function register(address instantiation)
    internal
    {
        isInstantiation[instantiation] = true;
        instantiations[msg.sender].push(instantiation);

        emit LogPullPaymentContractInstantiation(msg.sender, instantiation);
    }
}

// File: contracts/PullPayment/PullPaymentAccount.sol

/// @title Pull Payment Account - Contract that facilitates our pull payment protocol
/// @author PumaPay Dev Team - <developers@pumapay.io>
contract PullPaymentAccount is Ownable {
    using SafeMath for uint256;
    /// =================================================================================================================
    ///                                      Events
    /// =================================================================================================================

    event LogPaymentRegistered(address beneficiaryAddress, string paymentID);
    event LogPaymentCancelled(address beneficiaryAddress, string paymentID);
    event LogPullPaymentExecuted(address beneficiaryAddress, string paymentID);

    /// =================================================================================================================
    ///                                      Constants
    /// =================================================================================================================

    /// This transforms the Rate from decimals to uint256
    uint256 constant private DECIMAL_FIXER = 10000000000; // 10^10
    uint256 constant private FIAT_TO_CENT_FIXER = 100;
    uint256 constant private ONE_ETHER = 1 ether;

    /// =================================================================================================================
    ///                                      Members
    /// =================================================================================================================

    PumaPayToken public token;
    PumaPayOracle public oracle;

    uint256 public paymentCounter;
    address public signatory;

    mapping (address => RecurringPayment) public recurringPayments;

    struct RecurringPayment {
        string merchantID;                      /// ID of the merchant
        string paymentID;                       /// ID of the payment
        string currency;                        /// 3-letter abbr i.e. 'EUR'
        uint256 fiatAmountInCents;              /// payment amount in fiat in cents
        uint256 frequency;                      /// how often merchant can pull - in seconds
        uint256 numberOfPayments;               /// amount of pull payments merchant can make
        uint256 startTimestamp;                 /// when subscription starts - in seconds
        uint256 nextPaymentTimestamp;           /// timestamp of next payment
        uint256 lastPaymentTimestamp;           /// timestamp of last payment
        uint256 cancelTimestamp;                /// timestamp the payment was cancelled
    }

    /// =================================================================================================================
    ///                                      Modifiers
    /// =================================================================================================================

    modifier onlySignatory() {
        require(msg.sender == signatory);
        _;
    }

    modifier paymentExists(address _beneficiary) {
        require(doesPaymentExist(_beneficiary));
        _;
    }

    modifier paymentNotCancelled(address _beneficiary) {
        require(recurringPayments[_beneficiary].cancelTimestamp == 0);
        _;
    }

    modifier isPullPaymentRequestValid(address _beneficiary) {
        require(
            now >= recurringPayments[_beneficiary].startTimestamp &&
            now >= recurringPayments[_beneficiary].nextPaymentTimestamp &&
            recurringPayments[_beneficiary].numberOfPayments > 0 &&
        (recurringPayments[_beneficiary].cancelTimestamp == 0 ||
        recurringPayments[_beneficiary].cancelTimestamp > recurringPayments[_beneficiary].nextPaymentTimestamp)
        );
        _;
    }

    modifier validRequirements(address _owner, address _signatory, PumaPayToken _token, PumaPayOracle _oracle) {
        require(
            _owner != address(0) &&
            _token != address(0) &&
            _signatory != address(0) &&
            _oracle != address(0)
        );
        _;
    }

    modifier isValidDeletionRequest(string paymentID, address beneficiary) {
        require(
            beneficiary != address(0) &&
            bytes(paymentID).length != 0
        );
        _;
    }

    modifier isValidDeletion(
        uint8 v,
        bytes32 r,
        bytes32 s,
        string _paymentID,
        address _beneficiary
    ) {
        require(validateDeletion(
                v,
                r,
                s,
                _paymentID,
                _beneficiary
            )
        );
        _;
    }

    /// =================================================================================================================
    ///                                      Constructor
    /// =================================================================================================================

    /// @dev Contract constructor sets owner of the Pull Payment Account, the signatory, the token address to handle
    /// and the oracle that provides the exchange rates.
    /// @param _owner Owner of the Pull Payment Account.
    /// @param _signatory Signatory of the Pull Payment Account.
    /// @param _token Token Address.
    /// @param _oracle Oracle Address.
    constructor (address _owner, address _signatory, PumaPayToken _token, PumaPayOracle _oracle)
    public
    validRequirements(_owner, _signatory, _token, _oracle)
    {
        owner = _owner;
        signatory = _signatory;
        token = _token;
        oracle = _oracle;
    }

    /// =================================================================================================================
    ///                                      Public Functions
    /// =================================================================================================================

    /// @dev Registers a new pull payment to the pull payment account - The registration needs to happen by the owner of the pull payment account
    /// and the pull payment account checks that the pull payment has been singed by the signatory of the account.
    /// Emits 'LogPaymentRegistered' with beneficiary address and paymentID.
    /// @param v - recovery ID of the ETH signature. - https://github.com/ethereum/EIPs/issues/155
    /// @param r - R output of ECDSA signature.
    /// @param s - S output of ECDSA signature.
    /// @param _merchantID - ID of the merchant.
    /// @param _paymentID - ID of the payment.
    /// @param _beneficiary - address that is allowed to execute this pull payment.
    /// @param _currency - currency of the payment / 3-letter abbr i.e. 'EUR'.
    /// @param _fiatAmountInCents - payment amount in fiat in cents.
    /// @param _frequency - how often merchant can pull - in seconds.
    /// @param _numberOfPayments - amount of pull payments merchant can make
    /// @param _startTimestamp - when subscription starts - in seconds.
    function registerPullPayment (
        uint8 v,
        bytes32 r,
        bytes32 s,
        string _merchantID,
        string _paymentID,
        address _beneficiary,
        string _currency,
        uint256 _fiatAmountInCents,
        uint256 _frequency,
        uint256 _numberOfPayments,
        uint256 _startTimestamp
    )
    public
    onlyOwner()
    {
        require(
            bytes(_paymentID).length != 0 &&
            bytes(_currency).length != 0 &&
            _beneficiary != address(0) &&
            _fiatAmountInCents > 0 &&
            _frequency > 0 &&
            _numberOfPayments > 0 &&
            _startTimestamp > 0
        );

        recurringPayments[_beneficiary].currency = _currency;
        recurringPayments[_beneficiary].fiatAmountInCents = _fiatAmountInCents;
        recurringPayments[_beneficiary].frequency = _frequency;
        recurringPayments[_beneficiary].startTimestamp = _startTimestamp;
        recurringPayments[_beneficiary].numberOfPayments = _numberOfPayments;

        if (!isValidRegistration(v, r, s, recurringPayments[_beneficiary])) revert();

        recurringPayments[_beneficiary].merchantID = _merchantID;
        recurringPayments[_beneficiary].paymentID = _paymentID;
        recurringPayments[_beneficiary].nextPaymentTimestamp = _startTimestamp;

        paymentCounter++;

        emit LogPaymentRegistered(_beneficiary, _paymentID);
    }

    /// @dev Deletes a pull payment for a beneficiary - The deletion needs to happen by the owner of the pull payment account
    /// and the pull payment account checks that the beneficiary has been singed by the signatory of the account.
    /// This method deletes the pull payment from the pull payments array for this beneficiary specified and
    /// also deletes the beneficiary from the beneficiaries array.
    /// Emits 'LogPaymentCancelled' with beneficiary address and paymentID.
    /// @param v - recovery ID of the ETH signature. - https://github.com/ethereum/EIPs/issues/155
    /// @param r - R output of ECDSA signature.
    /// @param s - S output of ECDSA signature.
    /// @param _paymentID - ID of the payment.
    /// @param _beneficiary - address that is allowed to execute this pull payment.
    function deletePullPayment (
        uint8 v,
        bytes32 r,
        bytes32 s,
        string _paymentID,
        address _beneficiary
    )
    public
    onlyOwner()
    paymentExists(_beneficiary)
    paymentNotCancelled(_beneficiary)
    isValidDeletionRequest(_paymentID, _beneficiary)
    isValidDeletion(v, r, s, _paymentID, _beneficiary)
    {
        recurringPayments[_beneficiary].cancelTimestamp = now;
        paymentCounter--;

        emit LogPaymentCancelled(_beneficiary, _paymentID);
    }

    /// @dev Executes a pull payment for the msg.sender - The pull payment should exist and the payment request
    /// should be valid in terms of when it can be executed.
    /// First we calculate the PMA to FIAT using the Oracle rate and the currency and we transfer from the
    /// signatory account the amount in PMA.
    /// After execution we set the last payment timestamp to NOW and the, the next payment timestamp is incremented by
    /// the frequency and the number of payments is decresed by 1.
    /// Emits 'LogPullPaymentExecuted' with msg.sender as the beneficiary address and the paymentID.
    function executePullPayment()
    public
    paymentExists(msg.sender)
    isPullPaymentRequestValid(msg.sender)
    {
        uint256 amountInPMA = calculatePMAFromFiat(recurringPayments[msg.sender].fiatAmountInCents, recurringPayments[msg.sender].currency);
        token.transferFrom(signatory, msg.sender, amountInPMA);

        recurringPayments[msg.sender].lastPaymentTimestamp = now;
        recurringPayments[msg.sender].nextPaymentTimestamp = recurringPayments[msg.sender].nextPaymentTimestamp + recurringPayments[msg.sender].frequency;
        recurringPayments[msg.sender].numberOfPayments = recurringPayments[msg.sender].numberOfPayments - 1;

        emit LogPullPaymentExecuted(msg.sender, recurringPayments[msg.sender].paymentID);
    }


    /// =================================================================================================================
    ///                                      Internal Functions
    /// =================================================================================================================

    /// @dev Calculates the PMA Rate for the fiat currency specified - The rate is being retrieved by the PumaPayOracle
    /// for the currency specified. The Oracle is being updated every minute for each different currency the our system supports.
    /// @param _fiatAmountInCents - payment amount in fiat CENTS so that is always integer
    /// @param _currency - currency in which the payment needs to take place
    /// RATE CALCULATION EXAMPLE
    /// ------------------------
    /// RATE ==> 1 PMA = 0.01 USD$
    /// 1 USD$ = 1/0.01 PMA = 100 PMA
    /// Start the calculation from one ether - PMA Token has 18 decimals
    /// Multiply by the DECIMAL_FIXER (1e+10) to fix the multiplication of the rate
    /// Multiply with the fiat amount in cents
    /// Divide by the Rate of PMA to Fiat in cents
    /// Divide by the FIAT_TO_CENT_FIXER to fix the _fiatAmountInCents
    function calculatePMAFromFiat(uint256 _fiatAmountInCents, string _currency)
    internal
    view
    returns (uint256) {
        uint256 rate = oracle.getRate(_currency);

        return ONE_ETHER.mul(DECIMAL_FIXER).mul(_fiatAmountInCents).div(rate).div(FIAT_TO_CENT_FIXER);
    }

    /// @dev Checks if a deletion request is valid by comparing the v, r, s params
    /// and the hashed params with the signatory address.
    /// @param v - recovery ID of the ETH signature. - https://github.com/ethereum/EIPs/issues/155
    /// @param r - R output of ECDSA signature.
    /// @param s - S output of ECDSA signature.
    /// @param recurringPayment - pull payment to be validated.
    /// @return bool - when the v, r, s params with the hashed params match the signatory address
    function isValidRegistration(
        uint8 v,
        bytes32 r,
        bytes32 s,
        RecurringPayment recurringPayment
    )
    internal
    view
    returns(bool)
    {
        return ecrecover(keccak256(
                abi.encodePacked(
                    recurringPayment.currency,
                    recurringPayment.fiatAmountInCents,
                    recurringPayment.frequency,
                    recurringPayment.numberOfPayments,
                    recurringPayment.startTimestamp
                )
            ), v, r, s) == signatory;
    }

    /// @dev Checks if a deletion request is valid by comparing the v, r, s params
    /// and the hashed params with the signatory address.
    /// @param v - recovery ID of the ETH signature. - https://github.com/ethereum/EIPs/issues/155
    /// @param r - R output of ECDSA signature.
    /// @param s - S output of ECDSA signature.
    /// @param _paymentID - ID of the payment.
    /// @param _beneficiary - address that is allowed to execute this pull payment.
    /// @return bool - when the v, r, s params with the hashed params match the signatory address
    function validateDeletion(
        uint8 v,
        bytes32 r,
        bytes32 s,
        string _paymentID,
        address _beneficiary
    )
    internal
    view
    returns(bool)
    {
        return ecrecover(keccak256(
                abi.encodePacked(
                    _paymentID,
                    _beneficiary
                )
            ), v, r, s) == signatory;
    }

    /// @dev Checks if a payment for a beneficiary exists.
    /// @param _beneficiary - address to execute a pull payment.
    /// @return bool - whether the beneficiary has a pull payment to execute.
    function doesPaymentExist(address _beneficiary)
    internal
    view
    returns(bool) {
        return (
        bytes(recurringPayments[_beneficiary].currency).length != 0 &&
        recurringPayments[_beneficiary].fiatAmountInCents != 0 &&
        recurringPayments[_beneficiary].frequency != 0 &&
        recurringPayments[_beneficiary].startTimestamp != 0 &&
        recurringPayments[_beneficiary].numberOfPayments > 0 &&
        recurringPayments[_beneficiary].nextPaymentTimestamp != 0
        );
    }
}

// File: contracts/PullPayment/PullPaymentAccountFactory.sol

/// @title Pull Payment Account factory - Allows creation of utility account.
/// @author PumaPay Dev Team - <developers@pumapay.io>
contract PullPaymentAccountFactory is Factory {

    /// =================================================================================================================
    ///                                      Public Functions
    /// =================================================================================================================

    /// @dev Allows verified creation of pull payment account.
    /// @param _owner Owner of the Pull Payment Account.
    /// @param _signatory Signatory of the Pull Payment Account.
    /// @param _token Token Address.
    /// @param _oracle Oracle Address.
    /// @return Returns pull paument account address.
    function create(address _owner, address _signatory, PumaPayToken _token, PumaPayOracle _oracle)
    public
    returns (address pullPaymentAccount)
    {
        pullPaymentAccount = new PullPaymentAccount(_owner, _signatory, _token, _oracle);
        register(pullPaymentAccount);
    }
}
