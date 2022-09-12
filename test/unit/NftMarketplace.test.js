const { expect, assert } = require("chai");
const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace", function () {

        let deployer, NftMarketplace, user, basicNft
        const PRICE = ethers.utils.parseEther("0.1")
        const TOKEN_ID = 0

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            deployer = accounts[0]
            user = accounts[1]
            await deployments.fixture(["all"])
            NftMarketplace = await ethers.getContract("NftMarketplace")
            basicNft = await ethers.getContract("BasicNFT")
            await basicNft.mintNft()
            await basicNft.approve(NftMarketplace.address, TOKEN_ID)
        })

        describe("listItem", async () => {
            it("emits event ItemListed, on listing", async () => {
                expect(await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE))
                    .to
                    .emit(
                        NftMarketplace.address,
                        "ItemListed"
                    )
            })

            it("reverts if item is already listed", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                const error = `NftAlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                await expect
                    (NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE))
                    .to.be.revertedWith(error)
            })

            it("allows only Nft Owner to list that nft", async () => {
                const user__NftMarketplace = NftMarketplace.connect(user)
                await expect
                    (user__NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE))
                    .to.be.revertedWith("NotNftOwner()")
            })

            it("needs Nft approval to be listed", async () => {
                await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                await expect
                    (NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE))
                    .to.be.revertedWith("NotApprovedForMarketplace()")
            })

            it("updates listing", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                const item = await NftMarketplace.getListings(basicNft.address, TOKEN_ID)
                assert.equal(item.price.toString(), PRICE)
                assert.equal(item.seller.toString(), deployer.address)
            })

        })

        describe("buyItem", function () {
            it("reverts if item is not lifted", async () => {
                const error = `NotListed("${ethers.constants.AddressZero}", ${TOKEN_ID})`
                await expect
                    (NftMarketplace.buyItem(ethers.constants.AddressZero, TOKEN_ID))
                    .to.be.revertedWith(error)
            })
            it("reverts if price is not met", async () => {
                const LOW_PRICE = ethers.utils.parseEther("0.01")
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                await expect
                    (NftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: LOW_PRICE }))
                    .to.be.revertedWith("PriceNotMet")
            })

            it("tranfers the ownership to the new user, adds proceedings to the seller and removes item from listing", async () => {
                const user__NftMarketplace = NftMarketplace.connect(user)
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                const oldOwner = await basicNft.ownerOf(TOKEN_ID)
                await user__NftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                const newOwner = await basicNft.ownerOf(TOKEN_ID)

                assert.equal(oldOwner.toString(), deployer.address)
                assert.equal(newOwner.toString(), user.address)

                const item = await NftMarketplace.getListings(basicNft.address, TOKEN_ID)
                assert.equal(item.price.toString(), 0)
                assert.equal(item.seller.toString(), 0)

            })

            it("emits event ItemBought", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                expect
                    (await NftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE }))
                    .to.emit("ItemBought")
            })

        })

        describe("cancelItem", async () => {
            it("reverts if there is not listing", async () => {
                await expect
                    (NftMarketplace.cancelItem(basicNft.address, TOKEN_ID))
                    .to.be.revertedWith("NotListed")
            })
            it("reverts if the msg.sender is not owner", async () => {
                const user__NftMarketplace = NftMarketplace.connect(user)
                await expect
                    (user__NftMarketplace.cancelItem(basicNft.address, TOKEN_ID))
                    .to.be.revertedWith("NotNftOwner()")
            })
            it("deletes the listing", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                await NftMarketplace.cancelItem(basicNft.address, TOKEN_ID)
                const item = await NftMarketplace.getListings(basicNft.address, TOKEN_ID)
                assert.equal(item.price.toString(), 0)
                assert.equal(item.seller.toString(), 0)
            })
            it("emits an event, ItemCancelled", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                expect
                    (await NftMarketplace.cancelItem(basicNft.address, TOKEN_ID))
                    .to.emit("ItemCancelled")
            })
        })

        describe("updateListing", async () => {
            it("reverts if there is not listing", async () => {
                await expect
                    (NftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE))
                    .to.be.revertedWith("NotListed")
            })
            it("reverts if the msg.sender is not owner", async () => {
                const user__NftMarketplace = NftMarketplace.connect(user)
                await expect
                    (user__NftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE))
                    .to.be.revertedWith("NotNftOwner()")
            })
            it("updates price to new price", async () => {
                const newPrice = ethers.utils.parseEther("0.2")
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                await NftMarketplace.updateListing(basicNft.address, TOKEN_ID, newPrice)
                const item = await NftMarketplace.getListings(basicNft.address, TOKEN_ID)
                assert.equal(item.price.toString(), newPrice)

            })
            it("emits an event, ItemListed", async () => {
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                expect
                    (await NftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE))
                    .to.emit("ItemListed")
            })
        })

        describe("withdrawProceeds", async () => {
            it("reverts if withdraw amount is 0", async () => {
                await expect
                    (NftMarketplace.withdrawProceeds())
                    .to.be.revertedWith("NoProceeds")
            })

            it("withdraws proceeds, transfer it to caller, and reset it to 0", async () => {
                const user__NftMarketplace = NftMarketplace.connect(user)
                await NftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)

                await user__NftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                const deployerProceedsBef = (await NftMarketplace.getProceeds(deployer.address))
                const deployerBalancesBef = (await deployer.getBalance())

                const txResponse = await NftMarketplace.withdrawProceeds()

                const transactionReceipt = await txResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)
                const deployerBalanceAfter = (await deployer.getBalance())

                assert.equal
                    (
                        deployerBalanceAfter.add(gasCost).toString(),
                        deployerProceedsBef.add(deployerBalancesBef).toString()
                    )

            })
        })

    })
