[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%joshmayr%2Fpanda-swap)

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [MetaMask wallet browser extension](https://metamask.io/download.html).

## Getting Started

### Clone This Repo

Use `git clone https://github.com/joshmayr/panda-swap.git` to get the files within this repository onto your local machine.

### Environment Setup

Duplicate `.env.example` to `.env` and fill out the `HARDHAT_CHAIN_ID` environment variable. The port from the example file, if it's free, will be fine in most cases.

Run `npm install`.

### Running The Smart Contract Locally

Compile the ABI for the smart contract using `npx hardhat compile`.

If you're successful, you'll recieve a confirmation message of:

```
Compilation finished successfully
```

And, a `src/artifacts` folder will be created in your project.

Deploy the smart contract to the local blockchain for testing with `npx hardhat node`.

If you're successful, you'll be presented with a number of account details in the CLI. Here's an example:

```
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Then in a new terminal window, `npx hardhat run scripts/deploy.js --network localhost`.

If you're successful, you'll get something like the following CLI output:

```
TEST NFT deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Swap deployed to: 0x3aF32612209e1C1b76C1942D7372aC1c6a8cb1d4
```

### Adding A Local Account To MetaMask

Open your MetaMask browser extension and change the network to `Localhost 8545`.

Next, import one of the accounts by adding its Private Key (for example, `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` to MetaMask.

If you're successful, you should see the a balance resembling something like `10000 ETH` in the wallet.

### Connecting The Front-End

In `.env` set `NEXT_PUBLIC_NFT_ADDRESS` & `NEXT_PUBLIC_SWAP_ADDRESS` environment variables to the address your smart contract was deployed to. For example, `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`.

In a new terminal window, load the front-end with `npm run dev`. If you want to use an alternate port from `3000`, use `npm run dev -- --port=1234`, or whatever port number you prefer.

## Demo'ing The Functionality

Once set up, go to `localhost:3000` (or whatever post number you used), to view your dApp in the browser.

Clicking `Mint` will bring you to the Mint page where you can mint Test NFTs in different wallets.

Clicking `Swap` will bring you to the Swap page where you can create and respond to different trade requests.

If you are creating a new trade request you will need to know the wallet address of the other party as well as the NFT ids that you wish to trade. After creating a trade request you will need to send the trade request id to the other party.

To accept or reject a trade request, search for the trade request by querying by trade id.

## Testing

To test your smart contracts, run `npx hardhat test`.

A sample test can be found in `test/swap-test.js`.

## Deploying To The Goerli Test Network

*This is a more advanced step after running the smart contract locally.*

Up to now, the smart contract has been running on a local blockchain. The next step, is to test how it works on a live test network. We'll do this by deploying to Ropsten.

### MetaMask

First, switch your MetaMask network from `Localhost 8545` to `Goerli Test Network`.

Then, view the account details of your test account. Click `Export Private Key`. After entering your password, you'll be given a private key. Copy and paste your private key (example, `df57089aefbcaf7ba0bc227dafbffa9fc08a93fdc65e1e42214a14efcf23656e`) as the value of `GOERLI_PRIVATE_KEY` in `.env`.

**Important:** Never expose the private key of an account with real assets inside. Always add private keys as environment variables. Never commit private keys to code.