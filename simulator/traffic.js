const { web3 } = require('../bot/connect')

async function simulate() {
  accounts = await web3.eth.getAccounts()

  setTimeout(function() {
    let txId1 = web3.eth.sendTransaction({from: accounts[1], to: accounts[2], value: '10000000'})
    console.log('A sent B 10 Gwei', txId1.transactionHash)

    let txId2 = web3.eth.sendTransaction({from: accounts[2], to: accounts[1], value: '10000000'})
    console.log('B sent A 10 Gwei', txId2.transactionHash)

    if (true) {
      simulate();
    }
  }, 1000)
}

simulate();