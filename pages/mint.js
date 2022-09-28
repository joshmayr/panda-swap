import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { HeadDetails } from './components/head'
import TestNFT from '../src/artifacts/contracts/TestNFT.sol/TestNFT.json'
import { useMoralis } from "react-moralis"
import { Navbar } from './components/header'
import { ConnectButton } from "web3uikit"


export default function Home() {
  const [nftContract, setNftContract] = useState(null);

  const { chainId: chainIdHex, isWeb3Enabled, user, account } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS
  const supportedChain = process.env.SUPPORTED_CHAIN_ID

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && nftAddress != null) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const nftContract = new ethers.Contract(nftAddress, TestNFT.abi, signer)

      setNftContract(nftContract)

    } else {
      console.log("Ethereum object not found")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  async function mintNFT() {
    if ( !account ) {
        return
      }
      try {
        const transaction = await nftContract.mint()
        await transaction.wait()
      } catch(error) {
        console.log(error)
      }
  }

  return (
    <div className="max-w-xl mt-36 mx-auto text-center px-4">
      <HeadDetails />
      <Navbar />

      <main className="space-y-8 mt-2">
        { ! process.env.NEXT_PUBLIC_GREETER_ADDRESS ? (
            <p className="text-md">
              Please add a value to the <pre>NEXT_PUBLIC_GREETER_ADDRESS</pre> environment variable.
            </p>
        ) : (
          <>
            <h1 className="text-4xl font-semibold mb-8">
              Mint Test NFT
            </h1>
            <div className="space-y-8">
                <div className="flex flex-col space-y-4">
                <button
                      className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md"
                      onClick={mintNFT}
                    >
                      Mint NFT
                    </button>
                </div>
                <div className="flex flex-col space-y-4">
                  <ConnectButton className="margin-auto" moralisAuth={false} />
                </div>
            </div>
          </>
        ) }
      </main>
    </div>
  )
}
