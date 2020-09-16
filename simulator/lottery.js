const { web3 } = require('../bot/connect')
const SimpleCounterArtifact = require("../build/contracts/SimpleCounter.json")

async function releaseLottery() {
  const accounts = await web3.eth.getAccounts()
  const owner = accounts[0]
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = SimpleCounterArtifact.networks[networkId];

  this.meta = new web3.eth.Contract(
    SimpleCounterArtifact.abi,
    deployedNetwork.address,
  );

  const { releaseNextIncrement } = this.meta.methods;

  try {
    console.log('submitting request to increment the counter')
    let tx = await releaseNextIncrement().send({from: owner})
    console.log('transactionHash: ', tx.transactionHash)
    let block = await web3.eth.getBlock('latest')
    console.log('current latest block: ', block.number)
  } catch (e) {
    console.error(e)
  }
}

releaseLottery()