const contractAddressPath = "../NextJS Moralis/constants/networkMappings.json"
const abiPath = "../NextJS Moralis/constants/"
const path = require("path")
const networkMappingsFile = path.resolve(contractAddressPath)
const abiFile = path.resolve(abiPath)
const fs = require("fs")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        await updateContractAddresses()
        await updateAbi()
    }
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const contractAddresses = JSON.parse(fs.readFileSync(networkMappingsFile, "utf8"))
    console.log("Updating Contract")
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(networkMappingsFile, JSON.stringify(contractAddresses))
}

async function updateAbi(){
    const BasicNFT = await ethers.getContract("BasicNFT")
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    console.log("Updating Abi")

    console.log(
        `${abiFile}/NftMarketplace.json`)
        // return
    fs.writeFileSync(
        `${abiFile}/NftMarketplace.json`, 
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    fs.writeFileSync(
        `${abiFile}/BasicNft.json`, 
        BasicNFT.interface.format(ethers.utils.FormatTypes.json)
    )
}
module.exports.tags = ["all", "frontend"] 