const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains } = require("../helper-hardhat-config")


module.exports = async function({getNamedAccounts, deployments}){

    const {deployer} = await getNamedAccounts()
    const {deploy, log} = deployments;

    log("\nNFT MARKETPLACE\n")
    const NftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(!developmentChains.includes(network.name)){
        log("Verifying")
        await verify(NftMarketplace.address, [])
    }   
}

module.exports.tags = ["all", "market"]