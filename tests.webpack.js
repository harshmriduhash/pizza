require('babel-polyfill');
const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');
const dirtyChai = require('dirty-chai');

chai.use(chaiEnzyme());
chai.use(dirtyChai);

const context = require.context('./src/client', true, /\.spec\.js$/);
context.keys().forEach(context);
