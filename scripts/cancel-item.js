const { network, ethers } = require("hardhat")
const { mineBlock } = require("../utils/mine-blocks")

const TOKEN_ID = 0
async function cancel() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNFT")
    const tx = await nftMarketplace.cancelItem(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log(`Nft Cancelled`)

    if (network.config.chainId == "31337")
        await mineBlock(2, sleepAmount = 1000)

}

cancel()
    .then(_ => process.exit(0))
    .catch(ex => {
        console.log(ex)
        process.exit(1)
    })