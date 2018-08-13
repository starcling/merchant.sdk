import { DataService, ISqlQuery } from '../../dist/src/utils/datasource/DataService';
import { PaymentDbConnector } from '../../dist/src/connector/dbconnector/PaymentDbConnector';

const dataservice = new DataService();
const paymentDbConnector = new PaymentDbConnector();

const paymentsTestData = require('../../resources/testData.json').payments;
const testPayment = paymentsTestData['insertTestPayment'];
let testId;

const insertTestPayment = async () => {
  const result = await paymentDbConnector.createPayment(testPayment);
  testId = result.data[0].id;
};

const clearTestPayment = async () => {
  const sqlQuery = {
    text: 'DELETE FROM public.tb_payments WHERE id = $1;',
    values: [testId]
  };
  await dataservice.executeQueryAsPromise(sqlQuery);
};

export {
    insertTestPayment,
    clearTestPayment
}