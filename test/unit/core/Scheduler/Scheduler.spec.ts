import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';
import { SchedulerBuffer } from '../../../../src/core/scheduler/ScheduleBuffer';
import { PaymentDbConnector } from '../../../../src/connector/dbconnector/PaymentDbConnector';
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
};

describe('A Scheduler', () => {

    before(async () => {
        SchedulerBuffer.reconnectToRedis();
    });

    after(async () => {
        SchedulerBuffer.closeConnection();
    });

    describe('with correct parameters', () => {

        beforeEach(async () => {
            await insertTestPayment();
        });

        afterEach(async () => {
            await paymentDbConnector.deletePayment(testId);
        });

        it('should execute every second', (done) => {
            let count = 0;
            const numberOfPayments = 3;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        it('should stop when numberOfPayments reaches 0', (done) => {
            const numberOfPayments = 2;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 100).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;
                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(payment.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        it('should stop when called stop() method', (done) => {
            let count = 0;
            const numberOfPayments = 4; //Must be even number

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        setTimeout(() => {
                            Scheduler.stop(payment.id);
                        }, (numberOfPayments / 2) * 1000);

                        setTimeout(() => {
                            expect(count).to.be.equal(numberOfPayments / 2);
                            // expect(payment.numberOfPayments).to.be.equal(numberOfPayments / 2);
                            expect(SchedulerBuffer.delete(payment.id)).to.be.equal(true);
                            expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                            done();
                        }, numberOfPayments * 1000 + delay);
                    }, 200);
                });
            });
        });

        it('should restart and execute missing payments, before endTS', (done) => {
            let count = 0;
            const numberOfPayments = 8;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();


                    setTimeout(async () => {
                        expect(count).to.be.equal(numberOfPayments / 4);
                        Scheduler.stop(payment.id);
                    }, (numberOfPayments / 4) * 1000);

                    setTimeout(() => {
                        Scheduler.restart(payment.id);
                    }, (numberOfPayments - 3) * 1000);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);
                });
            });
        });

        it('should restart and execute all payments stopped scheduler that hasnt started, after endTS', (done) => {
            let count = 0;
            const numberOfPayments = 8;

            paymentDbConnector.getPayment(testId).then(res => {
                let tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        payment.nextPaymentDate = Number(payment.nextPaymentDate) + payment.frequency;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    Scheduler.stop(payment.id);

                    setTimeout(() => {
                        Scheduler.restart(payment.id);
                    }, numberOfPayments * 1000 + delay);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);
                });
            });
        });

        it('should restart and execute all payments stopped scheduler that has started, after endTS', (done) => {
            let count = 0;
            const numberOfPayments = 8;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        payment.nextPaymentDate = Number(payment.nextPaymentDate) + payment.frequency;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        Scheduler.stop(payment.id);
                    }, (numberOfPayments / 2) * 1000);

                    setTimeout(() => {
                        Scheduler.restart(payment.id);
                    }, numberOfPayments * 1000 + delay);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);

                });
            });
        });

        it('should restart only once even if called multiple times', (done) => {
            let count = 0;
            const numberOfPayments = 8;
            const numberOfRestarts = 8;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        Scheduler.stop(payment.id);
                        expect(count).to.be.equal(numberOfPayments / 4);
                    }, (numberOfPayments / 4) * 1000 + 200);

                    setTimeout(() => {
                        for (let i = 0; i < numberOfRestarts; i++) {
                            Scheduler.restart(payment.id);
                        }
                    }, (numberOfPayments - 3) * 1000 + 200);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(payment.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);

                });
            });
        });

        it('should be able to run multiple instances', (done) => {
            let count = 0;
            const numberOfPayments = 3;
            const multipleInstances = 12;
            const ids = [];

            (async () => {
                for (let i = 0; i < multipleInstances; i++) {
                    const tempPayment = (await paymentDbConnector.createPayment(testPayment)).data[0];
                    ids.push(tempPayment.id);
                    tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                    tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
                    tempPayment.numberOfPayments = numberOfPayments;
                    tempPayment.frequency = 1;

                    const payment = (await paymentDbConnector.updatePayment(tempPayment)).data[0];

                    new Scheduler(payment.id, async () => {

                        const p = (await paymentDbConnector.getPayment(payment.id)).data[0];
                        count++;
                        p.numberOfPayments = p.numberOfPayments - 1;
                        await paymentDbConnector.updatePayment(p);
                    }).start();
                }
            })();


            setTimeout(() => {
                expect(count).to.be.equal(multipleInstances * numberOfPayments);

                for (let i = 0; i < multipleInstances; i++) {
                    expect(SchedulerBuffer.delete(ids[i])).to.be.equal(false);
                    paymentDbConnector.deletePayment(ids[i]);
                }

                done();
            }, numberOfPayments * 1000 + delay);
        });

        // it('should be able to stop & restart multiple instances', (done) => {
        //     let count = 0;
        //     const numberOfPayments = 8;
        //     const multipleInstances = 9;
        //     const ids = [];


        //     (async () => {
        //         for (let i = 0; i < multipleInstances; i++) {
        //             const tempPayment = (await paymentDbConnector.createPayment(testPayment)).data[0];
        //             ids.push(tempPayment.id);
        //             tempPayment.startTimestamp = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
        //             tempPayment.nextPaymentDate = Math.floor(new Date(Date.now() + 200).getTime() / 1000);
        //             tempPayment.numberOfPayments = numberOfPayments;
        //             tempPayment.frequency = 1;

        //             const payment = (await paymentDbConnector.updatePayment(tempPayment)).data[0];

        //             new Scheduler(payment.id, async () => {

        //                 const p = (await paymentDbConnector.getPayment(payment.id)).data[0];
        //                 count++;
        //                 p.numberOfPayments = p.numberOfPayments - 1;
        //                 await paymentDbConnector.updatePayment(p);
        //             }).start();
        //         }
        //     })();

        //     setTimeout(() => {
        //         for (let i = 0; i < multipleInstances / 3; i++) {
        //             Scheduler.stop(ids[i]);
        //         }
        //     }, (numberOfPayments / 4) * 1000);

        //     setTimeout(() => {
        //         for (let i = 0; i < multipleInstances / 3; i++) {
        //             Scheduler.restart(ids[i]);
        //         }
        //     }, (numberOfPayments - 3) * 1000);

        //     setTimeout(() => {
        //         expect(count).to.be.equal(multipleInstances * numberOfPayments);

        //         for (let i = 0; i < multipleInstances; i++) {
        //             expect(SchedulerBuffer.delete(ids[i])).to.be.equal(false);
        //             paymentDbConnector.deletePayment(ids[i]);
        //         }

        //         done();
        //     }, numberOfPayments * 1000 + delay);

        // });

        it('should be able to start if start timestamp is in the 5min window below current time', (done) => {
            let count = 0;
            const numberOfPayments = 3;
            const timeWindow = 2000; // Time window of 2 seconds

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() - timeWindow).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(payment.numberOfPayments).to.be.equal(0);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        it('should reduce numberOfPaymentson every execution', (done) => {
            let count = 0;
            let numberOfPayments = 3;
            let oldNumberOfPayments = numberOfPayments;

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() + 200).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {

                        const p = (await paymentDbConnector.getPayment(payment.id)).data[0];
                        count++;
                        p.numberOfPayments = p.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(p).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        const interval = setInterval(async () => {
                            const payment = (await paymentDbConnector.getPayment(testId)).data[0];
                            expect(payment.numberOfPayments).to.be.equal(--oldNumberOfPayments);

                            if (payment.numberOfPayments === 0) {
                                clearInterval(interval);
                                expect(count).to.be.equal(numberOfPayments);
                                done();
                            }

                        }, payment.frequency * 1000);
                    }, 200);

                });

            });
        });
    });

    describe('with incorrect parameters', () => {

        beforeEach(async () => {
            await insertTestPayment();
        });

        afterEach(async () => {
            await paymentDbConnector.deletePayment(testId);
        });

        it('should not be able to start if start timestamp is out of the 5min window below current time', (done) => {
            const c = 0;
            let count = c;
            const numberOfPayments = 3; //Run scheduler for 3 seconds
            const timeWindow = 301000; // Time window of 5 min and 1 second

            paymentDbConnector.getPayment(testId).then(res => {
                const tempPayment = res.data[0];
                tempPayment.startTimestamp = Number(`${Math.floor(new Date(Date.now() - timeWindow).getTime() / 1000)}`);
                tempPayment.numberOfPayments = numberOfPayments;
                tempPayment.frequency = 1;

                paymentDbConnector.updatePayment(tempPayment).then(response => {
                    const payment = response.data[0];

                    new Scheduler(payment.id, async () => {
                        count++;
                        payment.numberOfPayments = payment.numberOfPayments - 1;
                        await (new PaymentDbConnector().updatePayment(payment).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(count).to.be.equal(c);
                        done();
                    }, numberOfPayments * 1000 + delay);

                });
            });
        });
    });
});