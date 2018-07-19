
export class BlockchainController {

    /**
    * @description Method for registering an event for monitoring transaction on the blockchain
    * @param {string} txHash: Hash of the transaction that needs to be monitored
    * @returns {boolean} success/fail response
    */
    public monitorTransaction(txHash: string) {
        return true;
    }

    /**
    * @description Method for actuall execution of pull payment
    * @returns {object} null
    */
    public executePullPayment() {
        return null;
    }
}
