const { network } = require("hardhat")

async function sleep(timeInMs) {
    return new Promise(resolve =>
        setTimeout(resolve, timeInMs)
    )
}

async function mineBlock(amount, sleepAmount = 0) {
    // sleepAmount: waiting the mine
    console.log("Mining Blocks .....")

    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: []
        })
        if (sleepAmount) {
            console.log("Waiting ......")
            await sleep(sleepAmount)
        }
    }
}


module.exports = {
    mineBlock,
    sleep
}