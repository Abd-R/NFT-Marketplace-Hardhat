const {mineBlock} = require("../utils/mine-blocks")

const BLOCKS = 2
const SLEEP_TIME = 1000


async function mine() {
    await mineBlock(BLOCKS, (sleepAmount = SLEEP_TIME));
};


mine()
    .then(_ => process.exit(1))
    .catch(ex => {
        console.log(ex)
        process.exit(1)
    })
