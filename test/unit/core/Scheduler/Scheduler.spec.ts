import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';
import { SchedulerBuffer } from '../../../../src/core/scheduler/ScheduleBuffer';

chai.use(chaiAsPromised);
const expect = chai.expect;
const delay = 1000; //1 second

describe('A Scheduler', () => {
    describe('with a correct parameters and count', () => {

        it('should execute every second', (done) => {
            let count = 0;
            const endOffset = 3000; //Run scheduler for 3 seconds

            const tempSchedulerData = {
                id: 'test-sch-1',
                startTimestamp: `${new Date(Date.now() + delay).getTime() / 1000}`,
                endTimestamp: `${new Date(Date.now() + delay + endOffset).getTime() / 1000}`,
                frequency: 1,
            }

            new Scheduler(tempSchedulerData, () => {
                count++;
            }).start();

            setTimeout(() => {
                expect(count).to.be.equal(endOffset / 1000);
                done();
            }, endOffset + delay);

        });

        it('should stop on endTimestamp', (done) => {
            const endOffset = 2000; //Run scheduler for 2 seconds

            const tempSchedulerData = {
                id: 'test-sch-2',
                startTimestamp: `${new Date(Date.now() + delay).getTime() / 1000}`,
                endTimestamp: `${new Date(Date.now() + delay + endOffset).getTime() / 1000}`,
                frequency: 1,
            }

            new Scheduler(tempSchedulerData, () => { }).start();

            setTimeout(() => {
                expect(SchedulerBuffer.delete(tempSchedulerData.id)).to.be.equal(false);
                done();
            }, endOffset + delay + 50);

        });

        it('should stop when called stop() method', (done) => {
            let count = 0;
            const endOffset = 4000; //Run scheduler for 4 seconds has to be even number

            const tempSchedulerData = {
                id: 'test-sch-3',
                startTimestamp: `${new Date(Date.now() + delay).getTime() / 1000}`,
                endTimestamp: `${new Date(Date.now() + delay + endOffset).getTime() / 1000}`,
                frequency: 1,
            }

            new Scheduler(tempSchedulerData, () => {
                count++;
            }).start();

            setTimeout(() => {
                Scheduler.stop(tempSchedulerData.id);
            }, endOffset / 2 + delay);

            setTimeout(() => {
                expect(count).to.be.equal((endOffset / 2) / 1000);
                expect(SchedulerBuffer.delete(tempSchedulerData.id)).to.be.equal(true);
                expect(SchedulerBuffer.delete(tempSchedulerData.id)).to.be.equal(false);
                done();
            }, endOffset + delay);

        });
    });

});