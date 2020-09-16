const { web3 } = require('./connect')
var { sniper } = require('./sniper');

const SimpleCounterArtifact = require("../build/contracts/SimpleCounter.json")

exports.start = function(filters) {
  console.log('Watcher started. Watch filters set as follows:')
  console.log()
  console.log(filters)
  console.log()

  // Ensure all filters are lower case
  Object.keys(filters).forEach((key,index) => filters[key] = filters[key].toLowerCase())


  var subscription = web3.eth.subscribe('pendingTransactions', async function(error, txHash){
    if (!error)
      console.log(`New tx logged: ${txHash}`);

      // check the txpool status
      txpoolstatus = await web3.eth.txpool.status()
      console.log(`Pending tx count in txpool: ${web3.utils.hexToNumber(txpoolstatus.pending)}`)

      // get all the pending transactions
      pendingTransactions = await web3.eth.getPendingTransactions()

      // now filter these transactions by only the new transaction id and the watch filters
      const result = pendingTransactions.filter(tx => (
        tx.hash === txHash &&
        tx.from.toLowerCase() === filters.from &&
        tx.to.toLowerCase() === filters.to &&
        tx.input === filters.input)
      );

      if(Array.isArray(result) && result.length) {
        // Our watch case has been triggered!
        console.log(`Found matching tx: ${result[0].hash}. Gas price: ${result[0].gasPrice}`)

        // Submit a transaction for a trade based on this transaction
        sniper(result[0].gasPrice)
      }
    }
  )
}