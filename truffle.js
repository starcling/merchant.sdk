require('babel-register');
require('babel-polyfill');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 7545,
            network_id: '*', // Match any network id
            gasPrice: 1000000000
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,
            gas: 0xfffffffffff,
            gasPrice: 1000000000
        }
    },
    mocha: {
        useColors: true,
        slow: 30000,
        bail: true
    }
};