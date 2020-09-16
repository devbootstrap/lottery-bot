## Setting up on Ubuntu on Digital Ocean

On Digital Ocean start a new droplet and [configure it as required](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04). Make sure that the security including SSH and user access is configured as [indicated here](https://www.digitalocean.com/docs/droplets/tutorials/recommended-setup/).

## Server Specs

In Digital Ocean a 'General Purpose' droplet with 8 GB / 2 CPU and 25 GB SSD is ok for running a testnet node. Note that we will also attach an additional 100 GB volume to store the chaindata. All other settings like region can be set as needed and remember to include your SSH key so that you can [access the server](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04) when it is running.

## Installing Geth

In a Ubuntu terminal run the following to install Geth

```
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum -y
```

## Add new Volume (if required)

NOTE: you only need to add a volume if the size of the HD is less than 100 GB for syncing Ropsten

In Digital Ocean you will need to add on a new 100GB volume via the UI. This will automatically format and attach the volume to your instance but you must resize and mount it your self.

To resize run:

```
sudo e2fsck -f /dev/sda
```

To mount run (this script is also available in the Digital Ocean web UI)

```
# Create a mount point for your volume:
$ mkdir -p /mnt/ethereum

# Mount your volume at the newly-created mount point:
$ mount -o discard,defaults,noatime /dev/disk/by-id/scsi-0DO_Volume_ethereum /mnt/ethereum

# Change fstab so the volume will be mounted after a reboot
$ echo '/dev/disk/by-id/scsi-0DO_Volume_ethereum /mnt/ethereum ext4 defaults,nofail,discard 0 0' | sudo tee -a /etc/fstab
```

## Geth Sync

Use [Tmux](https://www.hamvocke.com/blog/a-quick-and-easy-guide-to-tmux/) to manage sessions and panes in the server and then run the following command in a pane in a tmux session to start syncing.

Below will start syncing in 'fast' mode (default):

```
geth --ropsten --datadir /mnt/ethereum --bootnodes "enode://6332792c4a00e3e4ee0926ed89e0d27ef985424d97b6a45bf0f23e51f0dcb5e66b875777506458aea7af6f9e4ffb69f43f3778ee73c81ed9d34c51c4b16b0b0f@52.232.243.152:30303,enode://94c15d1b9e2fe7ce56e458b9a3b672ef11894ddedd0c6f247e0f1d3487f52b66208fb4aeb8179fce6e3a749ea93ed147c37976d67af557508d199d9594c35f09@192.81.208.223:30303"
```

Below will start syncing in 'light' mode:

```
geth --syncmode light --ropsten --datadir /mnt/ethereum
```

### Attach a Geth console to the node

Use `geth attach` like so:

```
geth attach /mnt/ethereum/geth.ipc
```

...now in the console you can interact with the node and check sync procress:

```
eth.syncing
```

### Import private key for accounts with ether

First use the Ropsten faucet to add ether to your account then export the private key of that account into a text file and name it as you like (e.g. `nothing-important.txt`). Then upload that file to the droplet using `scp`:

```
scp nothing-important.txt user@serverip:~
```

Then import it into the local Geth node like so:

```
geth --keystore /mnt/ethereum/keystore account import nothing-important.txt
```

Now you can list your accounts using the cli

```
geth --keystore /mnt/ethereum/ account list
```

Rememebr to delete the private key txt file!

```
rm nothing-important.txt
```

### Create multiple new accounts directly on the geth node

Create N accounts. Below, I'll create two new accounts:

```
personal.newAccount('account1')
personal.newAccount('account2')
```

These are created into the keystore folder so you can check that from here:

```
ls /mnt/ethereum/keystore

// which outputs (ACCOUNT_N_ADDRESS will show your accounts)
UTC--2020-09-06T04-31-02.713743849Z--ACCOUNT_0_ADDRESS
UTC--2020-09-06T04-32-51.982078831Z--ACCOUNT_1_ADDRESS
UTC--2020-09-06T04-33-08.009418183Z--ACCOUNT_2_ADDRESS

geth --keystore /mnt/ethereum/keystore account list

// which outputs (ACCOUNT_N_ADDRESS will show your accounts)
Account #0: {ACCOUNT_0_ADDRESS} keystore:///mnt/ethereum/keystore/UTC--2020-09-06T04-31-02.713743849Z--ACCOUNT_0_ADDRESS
Account #1: {ACCOUNT_1_ADDRESS} keystore:///mnt/ethereum/keystore/UTC--2020-09-06T04-32-51.982078831Z--ACCOUNT_1_ADDRESS
Account #2: {ACCOUNT_2_ADDRESS} keystore:///mnt/ethereum/keystore/UTC--2020-09-06T04-33-08.009418183Z--ACCOUNT_2_ADDRESS
```

TIP!: **It is safe to transfer the entire keystore directory or the individual keys therein between ethereum nodes by simply copying**.

### Transfer funds from the funded account that was imported first (Account 0) to the new accounts

Use geth terminal to do the transfers (note you may need to unlock account[0] first using `personal.unlockAccount(eth.accounts[0], 'account0', 0)`)

```
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: web3.toWei(0.2, 'Ether')})
eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[2], value: web3.toWei(0.2, 'Ether')})

// Check balances
eth.getBalance(eth.accounts[1]) // 200000000000000000 (0.2 ETH)
eth.getBalance(eth.accounts[2]) // 200000000000000000 (0.2 ETH)
```

### Deploy the lottery contract from a local dev machine

Use truffle console connect to ropsten testnet using an Infura endpoint and load the account that has the test ether to deploy the lottery smart contract for this project. This can be done in the usual way and this repo is already setup to do that. Just need to add the .env file with the correct values to do that.

### Install the bot and dependencies on the geth node Droplet

Install the [latest version of nvm and nodejs](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04) as weland npm on Ubuntu.

```
sudo apt-get -y update
sudo apt-get -y upgrade
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh -o install_nvm.sh
bash install_nvm.sh
source ~/.bashrc
nvm install 12.18.3
sudo apt install npm
```

Check you have the desired versions:

```
node --version    // 12.18.3
nvm alias default // 12.18.3
```

Pull the source code into the Droplet and run npm to install the package dependencies

```
git clone https://github.com/devbootstrap/lottery-bot.git
cd lottery-bot
npm i
```

### Configure the .env file

Copy the .env.example file to .env and add the desired values to configure it.

```
cp .env.example .env
```

Update it with the desired values (only the settings required by the bot), for example:

```
GETH_IPC_PATH='/mnt/ethereum/geth.ipc'
WATCH_FROM='0x4f5877E51067d0d68784aA74C39871cb2eF2D9eB'
WATCH_TO='0xd4374552EC117c4DA775A04899A09CD973bD2385'
WATCH_INPUT='0xa7c568bb'
```

### Unlock all the sniper accounts

Unlock the accounts in the geth node like so:

```
personal.unlockAccount(eth.accounts[1], ACCOUNT_1_PASSWORD, 0)
personal.unlockAccount(eth.accounts[2], ACCOUNT_2_PASSWORD, 0)
personal.unlockAccount(eth.accounts[3], ACCOUNT_3_PASSWORD, 0)
```

... or use the `unlockAllAccounts()` function that was imported.

### Start up the bot

Now its time to start the bot!

```
node bot/init
```

### Release the next lottery number from the local truffle as the contract owner

Back on your local computer in truffle (using infura etc) run the lottory contract method to release the next number. This should be sniped by the bot!

```
sc = SimpleCounter.deployed()
sc.releaseNextIncrement()
```

### Different Geth Sync Options

There are several sync options as follows:

* **Full Sync**: Gets the block headers, the block bodies, and validates every element from genesis block.

* **Fast Sync**: Gets the block headers, the block bodies, it processes no transactions until current block - 64(*). Then it gets a snapshot state and goes like a full synchronization.

* **Light Sync**: Gets only the current state. To verify elements, it needs to ask to full (archive) nodes for the corresponding tree leaves.

## Ropsten Testnet

* Started in November 2016. Named after a subway station in Stockholm.
* Was DoS attacked in February 2017 which made synching slow and made clients consume a lot of disk space.
* Was revived in March 2017 and became usable again.
* Network id: 3
* Block time: sub-30 seconds
* Explorer https://ropsten.etherscan.io/
* Github https://github.com/ethereum/ropsten

**Pros**

* Best reproduces the current production environment, i.e. system and network conditions on the live Ethereum mainnet, because it's PoW net.
* Can be used with both geth and parity.
* Ether can be mined. Or requested from a faucet:
  - https://faucet.metamask.io/
  - http://faucet.ropsten.be:3001
  - https://faucet.bitfwd.xyz/

**Cons**

* Not immune to spam attacks. Because of this it's less stable.