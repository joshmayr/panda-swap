const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");

  describe("Swap", function () {
    async function deploySwapAndNFTFixture() {
        const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
    
        const TestNFT = await ethers.getContractFactory("TestNFT");
        const testNFT = await TestNFT.deploy();

        const Swap = await ethers.getContractFactory("Swap");
        const swap = await Swap.deploy(testNFT.address);
    
        return { swap, testNFT, owner, otherAccount, anotherAccount };
    }

    describe("Successful Trades", function () {
        it("Should complete open trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "accepted");
        });

        it("Sender can cancel open trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
        });

        it("Receiver can reject open trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
        });

        it("Sender can cancel open trade after transferring own NFT", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.transferFrom(owner.address, anotherAccount.address, 0);

            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
        });

        it("Receiver can reject open trade after transferring own NFT", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.connect(otherAccount).transferFrom(otherAccount.address, anotherAccount.address, 1);

            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
        });

        it("Sender can cancel open trade after receiver transfers NFT", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.connect(otherAccount).transferFrom(otherAccount.address, anotherAccount.address, 1);

            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
        });

        it("Receiver can reject open trade after sender transfers NFT", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.transferFrom(owner.address, anotherAccount.address, 0);

            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
        });
    });

    describe("Invalid Trade Actions", function () {
        it("Revert open trade if sender doesn't own nft", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();
            await testNFT.connect(anotherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);
            await testNFT.connect(anotherAccount).approve(swap.address, 2);

            await expect (swap.makeTradeRequest(otherAccount.address, 2, 1)).to.be.revertedWith("Sender must own offered NFT"); // TODO: Remove the with statement after removing redundant contract checks
        });

        it("Revert open trade if receiver doesn't own nft", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();
            await testNFT.connect(anotherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);
            await testNFT.connect(anotherAccount).approve(swap.address, 2);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 2)).to.be.revertedWith("Receiver must own requested NFT"); // TODO: Remove the with statement after removing redundant contract checks
        });
        
        it("Revert open trade if sender hasn't approved contract", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 2);

            await expect (swap.makeTradeRequest(otherAccount.address, 1, 2)).to.be.revertedWith("Sender must approve this contract"); // TODO: Remove the with statement after removing redundant contract checks
        });

        it("Revert cancel trade on a trade that doesn't exist", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 2);

            await expect (swap.cancelTradeRequest(1)).to.be.revertedWith("Trade is not open");
        });

        it("Revert reject trade on a trade that doesn't exist", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 2);

            await expect (swap.rejectTradeRequest(1)).to.be.revertedWith("Trade is not open");
        });

        it("Revert accept trade on a trade that doesn't exist", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 2);

            await expect (swap.acceptTradeRequest(1)).to.be.revertedWith("Trade is not open");
        });

        it("Revert accept trade when receiver hasn't approved contract", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.be.revertedWith("Receiver must approve this contract");
        });

        it("Revert when sender has revoked token approval", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.approve(ethers.constants.AddressZero, 0);

            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.be.revertedWith("Sender must approve this contract"); // TODO: Remove with statement after removing redundant contract lines
        });

        it("Revert when sender doesn't own nft", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.transferFrom(owner.address, anotherAccount.address, 0);

            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.be.revertedWith("Sender must own offered NFT"); // TODO: Remove with statement after removing redundant contract lines
        });

        it("Revert when receiver doesn't own nft", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            await testNFT.connect(otherAccount).transferFrom(otherAccount.address, anotherAccount.address, 1);

            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.be.revertedWith("Receiver must own requested NFT"); // TODO: Remove with statement after removing redundant contract lines
        });

        it("Revert when trying to reject an already rejected trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to reject an already canceled trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to reject an already accepted trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "accepted");
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to cancel an already rejected trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
            await expect (swap.cancelTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to cancel an already canceled trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
            await expect (swap.cancelTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to cancel an already accepted trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "accepted");
            await expect (swap.cancelTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to accept an already rejected trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");
            await expect (swap.acceptTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to accept an already canceled trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");
            await expect (swap.acceptTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to accept an already accepted trade", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "accepted");
            await expect (swap.acceptTradeRequest(0)).to.be.revertedWith("Trade is not open");
        });

        it("Revert when trying to accept trade as sender", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.acceptTradeRequest(0)).to.be.revertedWith("Only trade receiver can accept trade");
        });

        it("Revert when trying to accept trade as other account", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(anotherAccount).acceptTradeRequest(0)).to.be.revertedWith("Only trade receiver can accept trade");
        });

        it("Revert when trying to reject trade as sender", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.rejectTradeRequest(0)).to.be.revertedWith("Only trade receiver can reject trade");
        });

        it("Revert when trying to reject trade as other account", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(anotherAccount).rejectTradeRequest(0)).to.be.revertedWith("Only trade receiver can reject trade");
        });

        it("Revert when trying to cancel trade as receiver", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).cancelTradeRequest(0)).to.be.revertedWith("Only trade requester can cancel trade");
        });

        it("Revert when trying to reject trade as other account", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(anotherAccount).cancelTradeRequest(0)).to.be.revertedWith("Only trade requester can cancel trade");
        });
    });

    describe("Querying Trades", function () {
        it("Return pending trade details", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);

            const tradeDetails = await swap.queryTradeRequest(0);
            expect(tradeDetails[0]).to.equal(owner.address);
            expect(tradeDetails[1]).to.equal(otherAccount.address);
            expect(tradeDetails[2]).to.equal(0);
            expect(tradeDetails[3]).to.equal(1);
            expect(tradeDetails[4]).to.equal(true);
        });

        it("Return accepted trade details", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).acceptTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "accepted");

            const tradeDetails = await swap.queryTradeRequest(0);
            expect(tradeDetails[0]).to.equal(owner.address);
            expect(tradeDetails[1]).to.equal(otherAccount.address);
            expect(tradeDetails[2]).to.equal(0);
            expect(tradeDetails[3]).to.equal(1);
            expect(tradeDetails[4]).to.equal(false);
        });

        it("Return canceled trade details", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.cancelTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "canceled");

            const tradeDetails = await swap.queryTradeRequest(0);
            expect(tradeDetails[0]).to.equal(owner.address);
            expect(tradeDetails[1]).to.equal(otherAccount.address);
            expect(tradeDetails[2]).to.equal(0);
            expect(tradeDetails[3]).to.equal(1);
            expect(tradeDetails[4]).to.equal(false);
        });

        it("Return rejected trade details", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.connect(otherAccount).rejectTradeRequest(0)).to.emit(swap, "TradeUpdated").withArgs(0, "rejected");

            const tradeDetails = await swap.queryTradeRequest(0);
            expect(tradeDetails[0]).to.equal(owner.address);
            expect(tradeDetails[1]).to.equal(otherAccount.address);
            expect(tradeDetails[2]).to.equal(0);
            expect(tradeDetails[3]).to.equal(1);
            expect(tradeDetails[4]).to.equal(false);
        });

        it("Revert when querying a trade that doesn't exist", async function () {
            const { swap, testNFT, owner, otherAccount, anotherAccount } = await loadFixture(deploySwapAndNFTFixture);
            
            await testNFT.mint();
            await testNFT.connect(otherAccount).mint();

            await testNFT.approve(swap.address, 0);
            await testNFT.connect(otherAccount).approve(swap.address, 1);

            
            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(0, owner.address, otherAccount.address, 0, 1);
            await expect (swap.makeTradeRequest(otherAccount.address, 0, 1)).to.emit(swap, "TradeCreated").withArgs(1, owner.address, otherAccount.address, 0, 1);

            const tradeDetails = await swap.queryTradeRequest(0)
            const tradeDetails2 = await swap.queryTradeRequest(1)
            const tradeDetails3 = await swap.queryTradeRequest(2)
            expect(tradeDetails[0]).to.equal(owner.address);
            expect(tradeDetails[1]).to.equal(otherAccount.address);
            expect(tradeDetails[2]).to.equal(0);
            expect(tradeDetails[3]).to.equal(1);
            expect(tradeDetails[4]).to.equal(true);

            expect(tradeDetails2[0]).to.equal(owner.address);
            expect(tradeDetails2[1]).to.equal(otherAccount.address);
            expect(tradeDetails2[2]).to.equal(0);
            expect(tradeDetails2[3]).to.equal(1);
            expect(tradeDetails2[4]).to.equal(true);

            expect(tradeDetails3[4]).to.equal(false);
        });
    });
  });