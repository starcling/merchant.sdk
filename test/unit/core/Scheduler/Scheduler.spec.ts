import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';

chai.use(chaiAsPromised);
const expect = chai.expect;
const delay = 1000; //1 second

const testSchedulerData = require('../../../../resources/testData.json').scheduler;
const testInsertPayment = require('../../../../resources/testData.json').payments.insertTestPayment;

const clone = (src): any => {
    const obj = {};

    for (const key of Object.keys(src)) {
        obj[key] = src[key];
    }

    return obj;
}

describe('A Scheduler', () => {
    describe('with a correct parameters and count', () => {

        afterEach(async () => {
            // SchedulerBuffer.delete(testSchedulerData.id);
        });

        it('should execute every second', (done) => {
            const tempSchedulerData = clone(testSchedulerData);
            let count = 0;
            const endOffset = 3000; //Run scheduler for 3 seconds
            
            tempSchedulerData.startTimestamp = `${new Date(Date.now() + delay).getTime() / 1000}`;
            tempSchedulerData.endTimestamp = `${(new Date().getTime() + endOffset + delay) / 1000}`;
            tempSchedulerData.frequency = 1;
            

            new Scheduler(tempSchedulerData, () => {
                count++;
            }).start();

            setTimeout(() => {
                expect(count).to.be.equal(endOffset / 1000);
                done();
            }, endOffset + 1000);

        });
    });

});