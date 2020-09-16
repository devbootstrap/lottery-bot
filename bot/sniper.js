const { web3 } = require('./connect')
const SimpleCounterArtifact = require("../build/contracts/SimpleCounter.json")

exports.sniper = async function sniper(gasPrice) {
  accounts = await web3.eth.getAccounts()
  accounts = accounts.slice(1, accounts.length)

  const networkId = await web3.eth.net.getId();

  const deployedNetwork = SimpleCounterArtifact.networks[networkId];

  this.meta = new web3.eth.Contract(
    SimpleCounterArtifact.abi,
    deployedNetwork.address,
  );

  const { increment } = this.meta.methods;

  let success = false;

  console.log("Accounts ready! ", accounts)

  for(let i=0; i<1000; i++) {
    for(let j=0; j<accounts.length; j++) {
      try {
        if(!success){
          console.log('Couner: ', i)
          res = await increment().send({from: accounts[j], gasPrice: gasPrice})
          let block = await web3.eth.getBlock('latest')

          // we are here, so we made it
          success = true
          console.log('--------------')
          console.log('SUCCESS! -', i)
          console.log('transactionHash -', res.transactionHash)
          console.log('current latest block: ', block.number)
          console.log('--------------')
          }
        } catch (e) {
          console.log(`${i} - ${e.message}`)
        }
      }
    }
  }