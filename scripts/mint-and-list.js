const { ethers, network } = require("hardhat")
const { mineBlock } = require("../utils/mine-blocks")
const abi = require("../../NextJS Moralis/constants/BasicNft.json")

async function mintAndList() {
    const provider = ethers.getDefaultProvider(process.env.GOERLI_RPC_URL)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    let BasicNFT = new ethers.Contract("0xE964B7b83b65a1da864A75d31F314e33ADc0AE25", abi, signer);

    const price = ethers.utils.parseEther("0.1")
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    // const BasicNFT = await ethers.getContract("BasicNFT")

    const mintTxRes = await BasicNFT.mintNft()
    const mintTxRec = await mintTxRes.wait(1)
    const tokenId = mintTxRec.events[0].args.tokenId
    console.log("Approving NFT")
    const approveTxRes = await BasicNFT.approve(NftMarketplace.address, tokenId)
    await approveTxRes.wait(1)
    console.log("Listing NFT")

    const listTxRes = await NftMarketplace.listItem(BasicNFT.address, tokenId, price)
    const listTxRec = await listTxRes.wait(1)

    if(network.config.chainId == 31337) 
        await mineBlock(1, (sleepAmount = 100))

    // console.log(listTxRec) 

    console.log("NFT Listed")
}


mintAndList()
    .then()
    .catch()