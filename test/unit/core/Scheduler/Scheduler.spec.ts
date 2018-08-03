import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';
import { SchedulerBuffer } from '../../../../src/core/scheduler/ScheduleBuffer';

chai.use(chaiAsPromised);
const expect = chai.expect;
const delay = 1000; //1 second

describe('A Scheduler', () => {
    describe('with correct parameters', () => {

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
            }, endOffset + delay + 150);

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

        it('should be able to run multiple instances', (done) => {
            let count = 0;
            const endOffset = 3000; //Run scheduler for 3 seconds
            const multipleInstances = 3;
            const tempID = 'test-sch-4-';

            const tempSchedulerData = {
                id: '',
                startTimestamp: `${new Date(Date.now() + delay).getTime() / 1000}`,
                endTimestamp: `${new Date(Date.now() + delay + endOffset).getTime() / 1000}`,
                frequency: 1,
            }

            for (let i = 0; i < multipleInstances; i++) {
                const temp = Object.assign({}, tempSchedulerData);
                temp.id = tempID + i;

                new Scheduler(temp, () => {
                    count++;
                }).start();
            }

            
            setTimeout(() => {
                expect(count).to.be.equal((multipleInstances * endOffset) / 1000);

                for (let i = 0; i < multipleInstances; i++) {
                    expect(SchedulerBuffer.delete(tempID + i)).to.be.equal(false);
                }

                done();
            }, endOffset + delay + 150);

        });

        it('should be able to start if start timestamp is in the 5min window below current time', (done) => {
            let count = 0;
            const endOffset = 3000; //Run scheduler for 3 seconds
            const timeWindow = 2000; // Time window of 2 seconds

            const startTS = `${new Date(Date.now() - timeWindow).getTime() / 1000}`;
            const endTS = `${Number(startTS) + (endOffset + timeWindow + 1000)/1000}`;

            const tempSchedulerData = {
                id: 'test-sch-5',
                startTimestamp: startTS,
                endTimestamp: endTS,
                frequency: 1,
            }

            new Scheduler(tempSchedulerData, () => {
                count++;
            }).start();

            
            setTimeout(() => {
                expect(count).to.be.equal((endOffset) / 1000);

                done();
            }, endOffset + timeWindow);

        });
    });

    describe('with incorrect parameters', () => {
        it('should not be able to start if start timestamp is out of the 5min window below current time', (done) => {
            const c = 0
            let count = c;
            const endOffset = 3000; //Run scheduler for 3 seconds
            const timeWindow = 301000; // Time window of 5 min and 1 second

            const startTS = `${new Date(Date.now() - timeWindow).getTime() / 1000}`;
            const endTS = `${Number(startTS) + (endOffset + timeWindow + 1000)/1000}`;

            const tempSchedulerData = {
                id: 'test-sch-5',
                startTimestamp: startTS,
                endTimestamp: endTS,
                frequency: 1,
            }

            new Scheduler(tempSchedulerData, () => {
                count++;
            }).start();

            
            setTimeout(() => {
                expect(count).to.be.equal(c);

                done();
            }, endOffset);

        });
    });
});