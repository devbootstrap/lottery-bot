function unlockAllAccounts() {
  for(var i=0; i<eth.accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], "Account" + i, 0);
    console.log("Account: " + i + " : " + personal.listWallets[0].status)
  }
};