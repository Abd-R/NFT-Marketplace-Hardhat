const { ethers, network } = require("hardhat")
const { mineBlock } = require("../utils/mine-blocks")

const TOKEN_ID = 5
async function update() {
    const newPrice = ethers.utils.parseEther("0.4")
    const NftMarketplace = await ethers.getContract("NftMarketplace")
    const BasicNFT = await ethers.getContract("BasicNFT")

    const TxRes = await NftMarketplace.updateListing(BasicNFT.address, TOKEN_ID, newPrice)
    await TxRes.wait(1)
    
    if (network.config.chainId == 31337)
        await mineBlock(1, (sleepAmount = 100))

    // console.log(listTxRec) 
    console.log("NFT Listed")
}


update()
    .then()
    .catch()