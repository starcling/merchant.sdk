import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';
import { SchedulerBuffer } from '../../../../src/core/scheduler/ScheduleBuffer';
import { PaymentDbConnector } from '../../../../src/connector/dbConnector/paymentsDBconnector';
import { IPaymentInsertDetails } from '../../../../src/core/payment/models';

chai.use(chaiAsPromised);
const expect = chai.expect;
const delay = 1000; //1 second

const paymentDbConnector = new PaymentDbConnector();

const paymentsTestData: any = require('../../../../resources/testData.json').payments;
const testPayment: IPaymentInsertDetails = paymentsTestData['insertTestPayment'];
var testId: string;

const insertTestPayment = async () => {
    const result = await paymentDbConnector.createPayment(testPayment);
    testId = result.data[0].id;
}

describe('A Scheduler', () => {
    describe('with correct parameters', () => {

        beforeEach(async () => {
            await insertTestPayment();
        });

        afterEach(async () => {
            await paymentDbConnector.deletePayment(testId);
        });

        it('should execute every second', (done) => {
            let count = 0;
            const limit = 3;

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date().getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => {
                    count++;
                }).start();

                setTimeout(() => {
                    expect(count).to.be.equal(limit);
                    done();
                }, limit * 1000 + delay);
            });
        });

        it('should stop when limit reaches 0', (done) => {
            const limit = 2;

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date().getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => { }).start();

                setTimeout(() => {
                    expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                    done();
                }, limit * 1000 + delay);
            });
        });

        it('should stop when called stop() method', (done) => {
            let count = 0;
            const limit = 4; //Must be even number

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date().getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => {
                    count++;
                }).start();

                setTimeout(() => {
                    Scheduler.stop(payment.id);
                }, (limit / 2) * 1000);

                setTimeout(() => {
                    expect(count).to.be.equal(limit / 2);
                    expect(SchedulerBuffer.delete(payment.id)).to.be.equal(true);
                    expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                    done();
                }, limit * 1000 + delay);
            });
        });

        it('should be able to run multiple instances', (done) => {
            let count = 0;
            const limit = 3;
            const multipleInstances = 3;
            const ids = [];

            for (let i = 0; i < multipleInstances; i++) {
                paymentDbConnector.createPayment(testPayment).then(res => {
                    ids.push(res.data[0].id);
                    paymentDbConnector.getPayment(ids[i]).then(response => {
                        const payment = response.data[0];
                        payment.startTimestamp = `${new Date().getTime() / 1000}`;
                        payment.limit = limit;
                        payment.frequency = 1;

                        new Scheduler(payment, () => {
                            count++;
                        }).start();
                    });
                })
            }

            setTimeout(() => {
                expect(count).to.be.equal(multipleInstances * limit);

                for (let i = 0; i < multipleInstances; i++) {
                    expect(SchedulerBuffer.delete(ids[i])).to.be.equal(false);
                }

                done();
            }, limit * 1000 + 2 * delay);
        });

        it('should be able to start if start timestamp is in the 5min window below current time', (done) => {
            let count = 0;
            const limit = 3;
            const timeWindow = 2000; // Time window of 2 seconds

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date(Date.now() - timeWindow).getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => {
                    count++;
                }).start();

                setTimeout(() => {
                    expect(count).to.be.equal(limit);
                    done();
                }, limit * 1000 + delay);
            });
        });

        it('should reduce limit on every execution', (done) => {
            let count = 0;
            let limit = 3;
            let oldLimit = limit;

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date().getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => {
                    count++;
                }).start();

                setTimeout(() => {
                    const interval = setInterval(async () => {
                        const payment = (await paymentDbConnector.getPayment(testId)).data[0];
                        // expect(payment.limit).to.be.equal(--oldLimit);

                        if (payment.limit === 0) {
                            clearInterval(interval);
                            expect(count).to.be.equal(limit);
                            done();
                        }

                    }, payment.frequency * 1000);
                }, 600);

            });
        });
    });

    describe('with incorrect parameters', () => {
        it('should not be able to start if start timestamp is out of the 5min window below current time', (done) => {
            const c = 0;
            let count = c;
            const limit = 3; //Run scheduler for 3 seconds
            const timeWindow = 301000; // Time window of 5 min and 1 second

            paymentDbConnector.getPayment(testId).then(res => {
                const payment = res.data[0];
                payment.startTimestamp = `${new Date(Date.now() - timeWindow).getTime() / 1000}`;
                payment.limit = limit;
                payment.frequency = 1;

                new Scheduler(payment, () => {
                    count++;
                }).start();

                setTimeout(() => {
                    expect(count).to.be.equal(c);
                    done();
                }, limit * 1000 + delay);
            });

        });
    });
});