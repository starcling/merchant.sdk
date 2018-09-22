import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Scheduler } from '../../../../src/core/scheduler/Scheduler';
import { SchedulerBuffer } from '../../../../src/core/scheduler/ScheduleBuffer';
import { MerchantSDK } from '../../../../src/MerchantSDKClass';
import { TestDbConnector } from '../../../../src/utils/datasource/TestDbConnector';
import { ISqlQuery, DataService } from '../../../../src/utils/datasource/DataService';

chai.use(chaiAsPromised);
const expect = chai.expect;
const should = chai.should;
const delay = 1000; //1 second

const testDbConnector = new TestDbConnector();
const dataservice = new DataService();
const paymentsTestData: any = require('../../../../resources/testData.json').payments;
const paymentTemplatesTestData: any = require('../../../../resources/testData.json').paymentTemplates;
const testPayment: any = paymentsTestData['insertTestPayment'];
const testPaymentTemplate: any = paymentTemplatesTestData['insertTestPaymentTemplate'];

var testId: string;

const settings = {
    web3: null,
    merchantApiUrl: null,
    getEnums: null,
    getPayment: new TestDbConnector().getPayment,
    updatePayment: new TestDbConnector().updatePayment,
    getTransactions: new TestDbConnector().getTransactionsByContractID,
    createTransaction: new TestDbConnector().createTransaction,
    updateTransaction: new TestDbConnector().updateTransaction,
    getPrivateKey: null,
    bankAddress: null
};

let sdk;

const insertTestPayment = async () => {
    testPaymentTemplate.frequency = 1;
    const result = await testDbConnector.createPaymentTemplate(testPaymentTemplate);
    testPayment.paymentID = result.data[0].id;
};

const clearTestPayment = async () => {
    const sqlQuery: ISqlQuery = {
        text: 'DELETE FROM public.tb_payments WHERE id = $1;',
        values: [testPayment.paymentID]
    };
    await dataservice.executeQueryAsPromise(sqlQuery);
};

describe('A Scheduler', () => {

    before(async () => {
        sdk = new MerchantSDK().build(settings);
        await insertTestPayment();
    });

    after(async () => {
        sdk.disconnectRedis();
        SchedulerBuffer.closeConnection();
        await clearTestPayment();
    });

    describe('with correct parameters', () => {

        beforeEach(async () => {
            testPayment.customerAddress = (Math.floor(Math.random() * 1e+30 + 1e20)).toString();
            const result = await testDbConnector.createPayment(testPayment);
            testId = result.data[0].id;
        });

        it('should execute every second', (done) => {
            let count = 0;
            const numberOfPayments = 3;

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];
                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        it('should stop when numberOfPayments reaches 0', (done) => {
            const numberOfPayments = 2;

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now()).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;
                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        it('should stop when called stop() method', (done) => {
            let count = 0;
            const numberOfPayments = 4; //Must be even number

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(async () => {
                        await Scheduler.stop(paymentContract.id);
                    }, (numberOfPayments / 2) * 1000 + 200);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments / 2);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(true);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });

        describe('start / stop / restart', async () => {
            let count: number = 0;
            const numberOfPayments: number = 8;

            before(async () => {
                testPayment.customerAddress = (Math.floor(Math.random() * 1e+30 + 1e20)).toString();
                const result = await testDbConnector.createPayment(testPayment);
                testId = result.data[0].id;
            });

            beforeEach('start scheduler', async () => {
                const tempContract = (await testDbConnector.getPayment(testId)).data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.nextPaymentDate = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                await testDbConnector.updatePayment(tempContract);

                new Scheduler(tempContract.id, async () => {
                    count++;
                    tempContract.numberOfPayments = tempContract.numberOfPayments - 1;
                    tempContract.nextPaymentDate = tempContract.numberOfPayments === 0
                        ? tempContract.nextPaymentDate : Number(tempContract.nextPaymentDate) + testPaymentTemplate.frequency;
                    await (new TestDbConnector().updatePayment(tempContract).catch(() => { }));
                }).start();

            })

            beforeEach('stop scheduler', async () => {
                setTimeout(async () => {
                    await Scheduler.stop(testId);
                }, (numberOfPayments / 4) * 1000 + 100);
            })

            it('should restart and execute missing payments, before endTS', (done) => {
                setTimeout(async () => {
                    expect(count).to.be.equal(numberOfPayments / 4);
                    await Scheduler.restart(testId);
                }, (numberOfPayments - 3) * 1000);

                setTimeout(() => {
                    // should.eventually.equal(count, numberOfPayments);
                    expect(count).to.be.equal(numberOfPayments);
                    // expect(paymentContract.numberOfPayments).to.be.equal(0);
                    expect(SchedulerBuffer.delete(testId)).to.be.equal(false);
                    done();
                }, numberOfPayments * 1000 + 2 * delay);
                // done();
            });
        });

        it('should restart and execute all payments stopped scheduler that hasnt started, after endTS', (done) => {
            let count = 0;
            const numberOfPayments = 8;

            testDbConnector.getPayment(testId).then(res => {
                let tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.nextPaymentDate = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];
                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        paymentContract.nextPaymentDate = paymentContract.numberOfPayments === 0
                            ? paymentContract.nextPaymentDate : Number(paymentContract.nextPaymentDate) + testPaymentTemplate.frequency;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    Scheduler.stop(paymentContract.id);

                    setTimeout(async () => {
                        await Scheduler.restart(paymentContract.id);
                    }, numberOfPayments * 1000 + delay);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);
                });
            });
        });

        it('should restart and execute all payments stopped scheduler that has started, after endTS', (done) => {
            let count = 0;
            const numberOfPayments = 8;

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.nextPaymentDate = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        paymentContract.nextPaymentDate = paymentContract.numberOfPayments === 0
                            ? paymentContract.nextPaymentDate : Number(paymentContract.nextPaymentDate) + testPaymentTemplate.frequency;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        Scheduler.stop(paymentContract.id);
                    }, (numberOfPayments / 2) * 1000);

                    setTimeout(() => {
                        Scheduler.restart(paymentContract.id);
                    }, numberOfPayments * 1000 + delay);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);

                });
            });
        });

        it('should restart only once even if called multiple times', (done) => {
            let count = 0;
            const numberOfPayments = 8;
            const numberOfRestarts = 5;

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.nextPaymentDate = Math.floor(new Date(Date.now() + delay).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(async () => {
                        await Scheduler.stop(paymentContract.id);
                    }, (numberOfPayments / 4) * 1000 + 100);

                    setTimeout(async () => {
                        expect(count).to.be.equal(numberOfPayments / 4);
                        for (let i = 0; i < numberOfRestarts; i++) {
                            Scheduler.restart(paymentContract.id);
                        }
                    }, (numberOfPayments - 4) * 1000);

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        expect(SchedulerBuffer.delete(paymentContract.id)).to.be.equal(false);
                        done();
                    }, numberOfPayments * 1000 + 2 * delay);
                });
            });
        });

        it('should be able to run multiple instances', (done) => {
            let count = 0;
            const numberOfPayments = 4;
            const multipleInstances = 10;
            const ids = [];

            (async () => {
                for (let i = 0; i < multipleInstances; i++) {
                    testPayment.customerAddress = (Math.floor(Math.random() * 1e+30 + 1e20)).toString();
                    const tempContract = (await testDbConnector.createPayment(testPayment)).data[0];
                    ids.push(tempContract.id);
                    tempContract.startTimestamp = Math.floor(new Date(Date.now() + 2 * delay).getTime() / 1000);
                    tempContract.nextPaymentDate = Math.floor(new Date(Date.now() + 2 * delay).getTime() / 1000);
                    tempContract.numberOfPayments = numberOfPayments;

                    await testDbConnector.updatePayment(tempContract);

                    new Scheduler(ids[i], async () => {

                        const p = (await testDbConnector.getPayment(ids[i])).data[0];
                        count++;
                        p.numberOfPayments = p.numberOfPayments - 1;
                        await testDbConnector.updatePayment(p);
                    }).start();
                }
            })();

            setTimeout(() => {
                expect(count).to.be.equal(multipleInstances * numberOfPayments);

                for (let i = 0; i < multipleInstances; i++) {
                    expect(SchedulerBuffer.delete(ids[i])).to.be.equal(false);
                }

                done();
            }, numberOfPayments * 1000 + 3 * delay);
        });

        it('should be able to start if start timestamp is in the 5min window below current time', (done) => {
            let count = 0;
            const numberOfPayments = 3;
            const timeWindow = 20000; // Time window of 20 seconds

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() - timeWindow).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
                    }).start();

                    setTimeout(() => {
                        expect(count).to.be.equal(numberOfPayments);
                        expect(paymentContract.numberOfPayments).to.be.equal(0);
                        done();
                    }, numberOfPayments * 1000 + delay);
                });
            });
        });
    });

    describe('with incorrect parameters', () => {
        beforeEach(async () => {
            testPayment.customerAddress = (Math.floor(Math.random() * 1e+30 + 1e20)).toString();
            const result = await testDbConnector.createPayment(testPayment);
            testId = result.data[0].id;
        });

        it('should not be able to start if start timestamp is out of the 5min window below current time', (done) => {
            const c = 0;
            let count = c;
            const numberOfPayments = 3; //Run scheduler for 3 seconds
            const timeWindow = 301000; // Time window of 5 min and 1 second

            testDbConnector.getPayment(testId).then(res => {
                const tempContract = res.data[0];
                tempContract.startTimestamp = Math.floor(new Date(Date.now() - timeWindow).getTime() / 1000);
                tempContract.numberOfPayments = numberOfPayments;

                testDbConnector.updatePayment(tempContract).then(response => {
                    const paymentContract = response.data[0];

                    new Scheduler(paymentContract.id, async () => {
                        count++;
                        paymentContract.numberOfPayments = paymentContract.numberOfPayments - 1;
                        await (new TestDbConnector().updatePayment(paymentContract).catch(() => { }));
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