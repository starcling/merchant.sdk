import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BlockchainHelper } from '../../../../src/core/Blockchain/utils/BlockchainHelper';

chai.use(chaiAsPromised);
const expect = chai.expect;

const web3 = require('web3');
const web3API = new web3(new web3.providers.HttpProvider('http://localhost:7545'))
let accounts;

let blockchainHelper = new BlockchainHelper(web3API);

describe('A Blockchain Helper', async () => {
    it('should return the nonce of an account', async () => {
        accounts = await web3API.eth.getAccounts();
        const nonceBefore = await blockchainHelper.getTxCount(accounts[0]);
        
        await web3API.eth.sendTransaction({to:accounts[1], from:accounts[0], value:web3API.utils.toWei("0.5", "ether")})
        await web3API.eth.sendTransaction({to:accounts[1], from:accounts[0], value:web3.utils.toWei("1.5", "ether")})

        const nonceAfter = await blockchainHelper.getTxCount(accounts[0]);

        expect((nonceAfter - nonceBefore)).to.be.equal(2);
    })
});