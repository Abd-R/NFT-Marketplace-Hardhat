const { network, ethers } = require("hardhat")
const { mineBlock } = require("../utils/mine-blocks")

const TOKEN_ID = 1  // from moralis Database
async function buy() {

    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNFT")
    const listing = await nftMarketplace.getListings(basicNft.address, TOKEN_ID)
    const price = listing.price.toString()
    const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price })

    await tx.wait(1)
    console.log(`Nft Bought`)

    if (network.config.chainId == "31337")
        await mineBlock(2, sleepAmount = 1000)

}

buy()
    .then(_ => process.exit(0))
    .catch(ex => {
        console.log(ex)
        process.exit(1)
    })