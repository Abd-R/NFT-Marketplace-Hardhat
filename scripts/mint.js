const { ethers, network } = require("hardhat")
const { mineBlock } = require("../utils/mine-blocks")

async function mintAndList() {
    console.log("Minting Nft.....")
    const BasicNFT = await ethers.getContract("BasicNFT")
    console.log(BasicNFT.address)

    const mintTxRes = await BasicNFT.mintNft()
    const mintTxRec = await mintTxRes.wait(1)
    console.log(mintTxRec)

    if(network.config.chainId == 31337) 
        await mineBlock(1, (sleepAmount = 100))
}

mintAndList()
    .then()
    .catch()