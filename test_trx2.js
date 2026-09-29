const { TronWeb } = require('tronweb');
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
const addr = tronWeb.address.fromPrivateKey('e56a738600d892d3f75d314abf7eb129ef66a4bc278fc499427b3e1cd0852e9f');
console.log(addr);
