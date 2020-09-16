const Web3 = require('web3');
const net = require('net');
const os = require('os');
require('dotenv').config({path:__dirname + '/../.env'})

let web3;

if (typeof web3 === 'undefined') {
  console.log('Initializing Web3 instance...');
  web3 = new Web3(new Web3.providers.IpcProvider(process.env.GETH_IPC_PATH, net));

  // Extend web3js with the txpool RPC methods
  web3.eth.extend({
    property: 'txpool',
    methods: [{
      name: 'content',
      call: 'txpool_content'
    },{
      name: 'inspect',
      call: 'txpool_inspect'
    },{
      name: 'status',
      call: 'txpool_status'
    }]
  });
}

exports.web3 = web3