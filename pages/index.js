import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { Swap } from "../utils/Swap.json";
import { TestNFT } from "../utils/TestNFT.json"
import { useMoralis } from "react-moralis";
import { ConnectButton } from "web3uikit";
import { Navbar } from "./components/header";
import { HeadDetails } from "./components/head";

export default function Trade() {
  const [senderAddress, setSenderAddress] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [senderTokenId, setSenderTokenId] = useState(-1);
  const [receiverTokenId, setReceiverTokenId] = useState(-1);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [pendingTradeId, setPendingTradeId] = useState(-1);
  const [tradeId, setTradeId] = useState(-1);
  const [formMode, setFormMode] = useState(0);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [senderStatus, setSenderStatus] = useState(0);
  const [receiverStatus, setReceiverStatus] = useState(0);
  const [swapContract, setSwapContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [showInvalidQuery, setShowInvalidQuery] = useState(false);

  const { chainId: chainIdHex, isWeb3Enabled, user, account } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS;
  const swapAddress = process.env.NEXT_PUBLIC_SWAP_ADDRESS;
  const supportedChain = process.env.SUPPORTED_CHAIN_ID;

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && swapAddress != null) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const swapContract = new ethers.Contract(swapAddress, Swap.abi, signer);
      const nftContract = new ethers.Contract(nftAddress, TestNFT.abi, signer);

      setNftContract(nftContract);
      setSwapContract(swapContract);
    } else {
      console.log("Ethereum object not found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId]);

  async function queryTradeRequest(newTradeId) {
    if (!account) {
      return;
    }
    try {
      if (newTradeId < 0) {
        return;
      }
      await setTradeId(newTradeId);
      const data = await swapContract.queryTradeRequest(newTradeId);

      updateTradeDetails(data[0], data[1], data[2], data[3], data[4]);
    } catch (error) {
      setShowTradeDetails(false);
      setShowInvalidQuery(true);
      console.log(error);
    }
  }

  async function updateTradeDetails(sender, receiver, senderToken, receiverToken, isOpen) {
    setSenderAddress(sender);
    setReceiverAddress(receiver);
    setSenderTokenId(senderToken);
    setReceiverTokenId(receiverToken);
    setIsTradeOpen(isOpen);
    setShowTradeDetails(true);
    setShowInvalidQuery(false);
  }

  // Call smart contract, perform action
  async function createTradeRequest() {
    if (!account) {
      return;
    }
    try {
      const transaction = await swapContract.makeTradeRequest(
        receiverAddress,
        Number(senderTokenId),
        Number(receiverTokenId)
      );
      await transaction.wait();

      updateTradeDetails(account, receiverAddress, senderTokenId, receiverTokenId, true);
    } catch (error) {
      console.log(error);
      setShowTradeDetails(false);
      setShowInvalidQuery(false);
    }
  }

  async function cancelTrade() {
    if (!account) {
      return;
    }
    try {
      const transaction = await swapContract.cancelTradeRequest(tradeId);
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  }

  async function rejectTrade() {
    if (!account) {
      return;
    }
    try {
      const transaction = await swapContract.rejectTradeRequest(tradeId);
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  }

  async function acceptTrade() {
    if (!account) {
      return;
    }
    try {
      const transaction = await swapContract.acceptTradeRequest(tradeId);
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  }

  async function approveSenderToken() {
    if (!account) {
      return;
    }
    try {
      await setSenderAddress(account);
      const transaction = await nftContract.approve(
        process.env.NEXT_PUBLIC_SWAP_ADDRESS,
        senderTokenId
      );
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  }

  async function approveToken(tokenId) {
    if (!account) {
      return;
    }
    try {
      const transaction = await nftContract.approve(process.env.NEXT_PUBLIC_SWAP_ADDRESS, tokenId);
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const onApprovalUpdated = async (owner, approved, tokenId) => {
      if (owner == receiverAddress || owner == senderAddress) {
        await queryTradeRequest(pendingTradeId);
        getReceiverStatus();
        getSenderStatus();
      }
    };

    if (nftContract) {
      console.log("Listening");
      nftContract.on("Approval", onApprovalUpdated);
    }

    return () => {
      if (nftContract) {
        console.log("Done listening");
        nftContract.off("Approval", onApprovalUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftContract, senderAddress, receiverAddress, senderTokenId]);

  useEffect(() => {
    const onTradeUpdated = async (createdTradeId, sender, receiver, senderId, receiverId) => {
      if (receiver == receiverAddress || sender == senderAddress) {
        await setTradeId(Number(createdTradeId));
        await queryTradeRequest(createdTradeId);
        getReceiverStatus();
        getSenderStatus();
      }
    };

    if (swapContract) {
      console.log("Listening");
      swapContract.on("TradeCreated", onTradeUpdated);
    }

    return () => {
      if (swapContract) {
        console.log("Done listening");
        swapContract.off("TradeCreated", onTradeUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapContract, senderAddress, receiverAddress, senderTokenId, receiverTokenId]);

  async function checkIfContractApproved(nftId) {
    if (!account) {
      return;
    }
    try {
      const approvedAddress = await nftContract.getApproved(nftId.toString());
      return approvedAddress == process.env.NEXT_PUBLIC_SWAP_ADDRESS;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function checkIfUserOwnsNFT(address, nftId) {
    if (!account) {
      return;
    }
    try {
      const ownerAddress = await nftContract.ownerOf(nftId);
      return ownerAddress.toLowerCase() == address.toLowerCase();
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getSenderStatus() {
    if (senderTokenId != -1 && senderAddress != "") {
      if (await checkIfUserOwnsNFT(senderAddress, senderTokenId)) {
        if (await checkIfContractApproved(senderTokenId)) {
          setSenderStatus(3);
        } else {
          setSenderStatus(2);
        }
      } else {
        setSenderStatus(1);
      }
    } else {
      setSenderStatus(0);
    }
  }

  async function getReceiverStatus() {
    if (receiverTokenId != -1 && receiverAddress != "") {
      if (await checkIfUserOwnsNFT(receiverAddress, receiverTokenId)) {
        if (await checkIfContractApproved(receiverTokenId)) {
          setReceiverStatus(3);
        } else {
          setReceiverStatus(2);
        }
      } else {
        setReceiverStatus(1);
      }
    } else {
      setReceiverStatus(0);
    }
  }

  useEffect(() => {
    getSenderStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderTokenId, senderAddress]);

  useEffect(() => {
    getReceiverStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverTokenId, receiverAddress]);

  return (
    <div className='max-w-xl mt-36 mx-auto text-center px-4'>
      <HeadDetails />
      <Navbar />

      <main className='space-y-8 mt-2'>
        <h1 className='text-4xl font-semibold mb-8'>Trade</h1>
        <div className='space-y-8'>
          <div className='grid gap-6 w-full md:grid-cols-2'>
            <div className='w-full relative inline-flex items-center justify-center'>
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                onClick={() => {
                  setFormMode(1);
                  setShowTradeDetails(false);
                  setShowInvalidQuery(false);
                }}
                disabled={!account}
              >
                Query Trade
              </button>
            </div>
            <div className='w-full relative inline-flex items-center justify-center'>
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                onClick={() => {
                  setFormMode(2);
                  setShowTradeDetails(false);
                  setShowInvalidQuery(false);
                  setSenderAddress(account);
                }}
                disabled={!account}
              >
                Create Trade
              </button>
            </div>
          </div>
          {formMode == 2 && (
            <div className='flex flex-col space-y-4'>
              <input
                onChange={(event) => {
                  setReceiverAddress(event.target.value);
                }}
                type='text'
                placeholder='Receiver Address'
                className='border p-4 w-100 text-center'
              />
              <input
                onChange={(event) => {
                  setSenderTokenId(event.target.value);
                }}
                type='number'
                placeholder='Sender Token Id'
                className='border p-4 w-100 text-center'
              />
              <input
                onChange={(event) => {
                  setReceiverTokenId(event.target.value);
                }}
                type='number'
                placeholder='Receiver Token Id'
                className='border p-4 w-100 text-center'
              />
              {senderStatus == 2 && (
                <button
                  className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                  onClick={() => approveSenderToken()}
                >
                  Approve Token To Trade
                </button>
              )}
              {senderStatus == 3 && (
                <button
                  className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                  onClick={createTradeRequest}
                >
                  Create Trade Request
                </button>
              )}
            </div>
          )}

          {formMode == 1 && (
            <div className='flex flex-col space-y-4'>
              <input
                onChange={(event) => {
                  setPendingTradeId(event.target.value);
                  /*setTradeId(event.target.value)*/
                }}
                type='number'
                placeholder='Trade ID'
                className='border p-4 w-100 text-center'
              />
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                onClick={() => queryTradeRequest(pendingTradeId)}
                disabled={!account || pendingTradeId < 0}
              >
                Query Trade Request
              </button>
            </div>
          )}

          {showInvalidQuery && (
            <div className='flex flex-col space-y-4'>That Trade ID is invalid</div>
          )}

          {showTradeDetails && (
            <div className='flex flex-col space-y-4'>
              <div>
                <div>Trade ID: {tradeId.toString()}</div>
                <div>Trade Sender: {senderAddress.toString()}</div>
                <div>Trade Receiver: {receiverAddress.toString()}</div>
                <div>Sender NFT ID: {senderTokenId.toString()}</div>
                <div>Receiver NFT ID: {receiverTokenId.toString()}</div>
                <div>
                  Is Trade Open: <b>{isTradeOpen.toString()}</b>
                </div>
              </div>
              {isTradeOpen && (
                <div className='flex flex-col space-y-4'>
                  {account.toLowerCase() == receiverAddress.toLowerCase() && (
                    <div className='flex flex-col space-y-4'>
                      <button
                        className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                        onClick={rejectTrade}
                      >
                        Reject Trade Request
                      </button>
                      {receiverStatus == 3 && (
                        <button
                          className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                          onClick={acceptTrade}
                        >
                          Accept Trade Request
                        </button>
                      )}
                      {receiverStatus == 2 && (
                        <button
                          className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                          onClick={() => approveToken(receiverTokenId)}
                        >
                          Approve Token To Accept Trade
                        </button>
                      )}
                    </div>
                  )}
                  {account == senderAddress && (
                    <div>
                      <button
                        className='bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md w-full'
                        onClick={cancelTrade}
                      >
                        Cancel Trade Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className='flex flex-col space-y-4'>
            <ConnectButton className='margin-auto' moralisAuth={false} />
          </div>
        </div>
      </main>
    </div>
  );
}
