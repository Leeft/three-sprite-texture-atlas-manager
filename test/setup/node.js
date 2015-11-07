global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

let chaiAsPromised = require('chai-as-promised');
chai.use( chaiAsPromised );

require('babel-core/register');
require('./setup')();
