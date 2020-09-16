# Lottery Bot Development

## Installing Geth (MacOS)

On a Mac we can use `brew` to install the `geth` client.

```
brew install geth
```

Check that `geth` is correctly installed globally:

```
geth version
```

...you should see something like this output:

```
Geth
Version: 1.9.12-stable
Architecture: amd64
Protocol Versions: [65 64 63]
Go Version: go1.14
Operating System: darwin
GOPATH=
GOROOT=/usr/local/Cellar/go/1.14/libexec
```

## Installing Geth (Ubuntu 20.04)

If you are using Ubuntu or you want to run this bot in AWS / Digital Ocean etc then in your Ubuntu terminal run:

```
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum -y
```

## Genesis.json

Using the provided [genesis.json](./genesis.json) file we can write our first block using the following command.

```
geth --datadir ./geth-test init genesis.json
```

You should see some output including the following final two statements:

```
INFO [08-17|12:38:00.503] Writing custom genesis block
INFO [08-17|12:38:00.503] Persisted trie from memory database      nodes=0 size=0.00B time=4.085µs  gcnodes=0 gcsize=0.00B gctime=0s livenodes=1 livesize=0.00B
INFO [08-17|12:38:00.504] Successfully wrote genesis state         database=lightchaindata hash=6e92f8…23a660
```

## Start the private network

Now we can start our private network using the following command

```
geth --nodiscover --datadir ./geth-test --networkid 15
```

Now in a separate terminal attach to the running node using the IPC connection

```
geth attach ./geth-test/geth.ipc
```

ALTERNATIVELY you can start in `light` mode and sync with a testnet on you local computer like so

```
geth --syncmode light --ropsten --nodiscover --datadir ./geth-ropsten
geth attach ./geth-ropsten/geth.ipc
```

There will be some output and then, on last line, you can see a terminal session is waiting our command! (>).

## Issue commands to the private network

In the Geth REPL session, you can issue commands like so:

```
> eth.blockNumber
0
> eth.accounts
[]
```

Note that we are on a private network of our own so that is why block number is 0 and there are no accounts. Lets therefore create a new account using the `personal` namespace. By the way to see the available methods ina name space just type the namespace like so:

```
> personal
personal
{
  listAccounts: [],
  listWallets: [],
  newAccount: function(),
  ...etc...
```

So for example we can use `newAccount` to create a new account like so:

```
> personal.newAccount('Darren')

INFO [08-17|12:54:31.821] Your new key was generated               address=0x13C558e47C26BD998F8eCA719C01459e363a0D4f
WARN [08-17|12:54:31.821] Please backup your key file!             path=./geth-test/keystore/UTC--2020-08-17T05-54-30.190499000Z--13c558e47c26bd998f8eca719c01459e363a0d4f
WARN [08-17|12:54:31.821] Please remember your password!
```

We now have an account to use:

```
> eth.accounts
["0x13c558e47c26bd998f8eca719c01459e363a0d4f"]
```

The balance of this account will be 0 Wei, as expected.

```
> eth.getBalance(eth.accounts[0])
0
```

## Start mining and reward the default account

Set the `etherbase` to the default account just created so that they are rewarded for mining:

```
> miner.setEtherbase('0x13c558e47c26bd998f8eca719c01459e363a0d4f')
```

Now start mining and making money (although there is not much to mine on our private network!!)

```
> miner.start(1)
```

This is starting the miner with 1 thread. It will create a local DAG and while its

```
INFO [08-17|13:03:26.852] Generating DAG in progress epoch=0 **percentage=91** elapsed=1m57.351s
```

Once `percentage` reaches 100 you will see the following output which means you are mining blocks!:

```
INFO [08-17|13:08:12.212] Successfully sealed new block            number=86 sealhash=e3dc56…8ea2ef hash=2b8f9d…a216e7 elapsed=137.409ms
INFO [08-17|13:08:12.212] 🔗 block reached canonical chain          number=79 hash=adc50e…3fa794
INFO [08-17|13:08:12.212] 🔨 mined potential block                  number=86 hash=2b8f9d…a216e7
INFO [08-17|13:08:12.212] Commit new mining work                   number=87 sealhash=6f8593…3c00e1 uncles=0 txs=0 gas=0 fees=0 elapsed=106.152
```

Now stop mining and check the block number as well as the default owners balance:

```
> miner.stop()
null
> eth.blockNumber
100
>
> eth.getBalance(eth.accounts[0])
500000000000000000000
> web3.fromWei('500000000000000000000')
"500"
```

Nice! 500 Ether for 100 Blocks - so thats 5 Ether per block!! Lets create a new account and send ether between them:

```
personal.newAccount('Sophia')
eth.accounts // should see two accounts here
eth.getBalance(eth.accounts[1]) // should show new account has 0 balance
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: web3.toWei(5, 'Ether')})
```

The last statement results in an error `Error: authentication needed: password or unlock` because the first account is locked. Lets confirm the status of the account like so:

```
> personal.listWallets[0].status
"Locked"
```

Also the pending transactions in the txpool is empty. Note below we can use `eth.pendingTransactions` or `txpool` to see the state of the transaction pool.

```
> eth.pendingTransactions
[]
> txpool
{
  content: {
    pending: {},
    queued: {}
  },
  inspect: {
    pending: {},
    queued: {}
  },
  status: {
    pending: 0,
    queued: 0
  },
  getContent: function(callback),
  getInspect: function(callback),
  getStatus: function(callback)
}
```

We unlock the account like so (note type in the passphrase which was passed into the personal.newAccount() function above - so in this case the passphrase is 'Darren').

```
web3.personal.unlockAccount(eth.accounts[0])
```

Note if you want to keep the account permanently unlocked you can pass in a duration parameter of 0 like so:

```
web3.personal.unlockAccount(eth.accounts[0], "Darren", 0)
```

Lets confirm its now unlocked

```
> personal.listWallets[0].status
"Unlocked"
```

Now we can try the transaction again:

```
> eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: web3.toWei(5, 'Ether')})
INFO [08-17|13:33:59.751] Setting new local account                address=0x13C558e47C26BD998F8eCA719C01459e363a0D4f
INFO [08-17|13:33:59.753] Submitted transaction                    fullhash=0x0c9e994667e50b447df239f71a891fcec6506dcd7ad55187742d5db9657e0927 recipient=0xBAa67002cD2de6CA4FD20c69386F3757a8645aA2
"0x0c9e994667e50b447df239f71a891fcec6506dcd7ad55187742d5db9657e0927"
```

This time it was accepted but note that its still 'pending' as shown below using the following command:

```
eth.pendingTransactions
[{
    blockHash: null,
    blockNumber: null,
    from: "0x13c558e47c26bd998f8eca719c01459e363a0d4f",
    gas: 21000,
    gasPrice: 1000000000,
    hash: "0x0c9e994667e50b447df239f71a891fcec6506dcd7ad55187742d5db9657e0927",
    input: "0x",
    nonce: 0,
    r: "0x5249a7380039eac37bb5b7383fb85b2302dd3496085f650f13d0e1975ab5b028",
    s: "0x23ec6c960cd180bc5b68043b3e5759f3c9770dae520f6b62fc1456f0c5d14e26",
    to: "0xbaa67002cd2de6ca4fd20c69386f3757a8645aa2",
    transactionIndex: null,
    v: "0x41",
    value: 5000000000000000000
}]
```

This is the transaction in the `txpool`:

```
> txpool
{
  content: {
    pending: {
      0x13C558e47C26BD998F8eCA719C01459e363a0D4f: {
        1: {...}
      }
    },
    queued: {}
  },
  inspect: {
    pending: {
      0x13C558e47C26BD998F8eCA719C01459e363a0D4f: {
        1: "0xBAa67002cD2de6CA4FD20c69386F3757a8645aA2: 5000000000000000000 wei + 21000 gas × 1000000000 wei"
      }
    },
  ...etc...
```

The balance of the new account is still 0 of course:

```
> eth.getBalance(eth.accounts[1])
0
```

So lets start mining, stop mining and then check again:

```
> miner.start(1)
> miner.stop()
> eth.getBalance(eth.accounts[1])
5000000000000000000
```

It worked! Now the second account has the ether.

### Add a script to geth

You need to start geth node

Then attach to it and then drop this into the console

```
loadScript('./geth/checkAllBalances.js')
loadScript('./geth/checkWork.js')
loadScript('./geth/unlockAllAccounts.js')
```

Now you can run the function that is defined in that file

```
checkAllBalances()

eth.accounts[0]: 0x78c6327a4a4ac946c59c4b0c4b75bd0bfc86c767 	balance: 7.93627513220227543 ether
eth.accounts[1]: 0xb3ca3169fb9b8f0a7678e52542716044f5364535 	balance: 1.123 ether
....etc
```