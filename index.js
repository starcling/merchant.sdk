require('ts-node').register({project: __dirname});
const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
    rootDir: '.',
    baseUrl: '.',
    paths: tsConfig.compilerOptions.paths
});

const {MerchantSDK} = require('./MerchantSDKClass');

module.exports.default = MerchantSDK;