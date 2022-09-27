// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Contract to trade pandas trustlessly
// For now it will be one contract per NFT collection

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract Swap is Ownable {
    using Counters for Counters.Counter;
    // User should be able to request a trade
    // User should be able to accept or reject a trade
    // User should be able to cancel a trade (also revoke token approval)
    // User should be able to see their list of open trades that they have offered
    // User should be able to see their list of trade requests that they have received
    // Trades should have an expiry date
    // In the future, NFT Contract owner should be able to set a royalty fee for trades of their collection
    // If there is a fee added, the trade sender is probably the one that should have to pay, the receiver pays a higher gas fee because they initiate the transfers.
        // Could have the sender send a small amount of ETH to the contract when sending trades to offset the receiver paying a high fee.
        // What happens in the case where the trade offer is rejected? Does the sender get his funds back?

    struct Trade {
        address sender;
        address receiver;
        uint256 senderTokenId;
        uint256 receiverTokenId;
        bool isTradeOpen;
    }

    address nftContractAddress;
    mapping(uint256 => Trade) trades;
    Counters.Counter private tradeId;

    event TradeCreated(uint256 tradeId, address sender, address receiver, uint256 senderId, uint256 receiverId);
    event TradeUpdated(uint256 tradeId, string);


    constructor(address _nftContractAddress) {
        nftContractAddress = _nftContractAddress;
    }

    

    // I don't think we need to store extra mappings for users -> open/received trade requests
    // I think we should be able to query for trades on the NFTs that the user owns
    // For now, we will just make users input the senderNftId, receiverNftId, and sender/receiver to send/accept trades

    function makeTradeRequest(address _receiver, uint256 _senderTokenId, uint256 _receiverTokenId) public {
        require(IERC721(nftContractAddress).ownerOf(_senderTokenId) == msg.sender, "Sender must own offered NFT");
        require(IERC721(nftContractAddress).ownerOf(_receiverTokenId) == _receiver, "Receiver must own requested NFT");
        require(IERC721(nftContractAddress).getApproved(_senderTokenId) == address(this), "Sender must approve this contract");

        trades[tradeId.current()] = Trade({
            sender: msg.sender,
            receiver: _receiver,
            senderTokenId: _senderTokenId,
            receiverTokenId: _receiverTokenId,
            isTradeOpen: true
        });

        //emit TradeUpdated(tradeId.current(), "pending"); // TODO: Update tests
        emit TradeCreated(tradeId.current(), msg.sender, _receiver, _senderTokenId, _receiverTokenId);
        tradeId.increment();
    }

    function acceptTradeRequest(uint256 _tradeId) public {
        Trade memory trade = trades[_tradeId];
        require(trade.isTradeOpen == true, "Trade is not open");
        require(trade.receiver == msg.sender, "Only trade receiver can accept trade");
        require(IERC721(nftContractAddress).ownerOf(trade.senderTokenId) == trade.sender, "Sender must own offered NFT"); // Redundant
        require(IERC721(nftContractAddress).ownerOf(trade.receiverTokenId) == msg.sender, "Receiver must own requested NFT"); // Redundant
        require(IERC721(nftContractAddress).getApproved(trade.senderTokenId) == address(this), "Sender must approve this contract"); // Redundant
        require(IERC721(nftContractAddress).getApproved(trade.receiverTokenId) == address(this), "Receiver must approve this contract"); // Redundant
        IERC721(nftContractAddress).safeTransferFrom(trade.sender, trade.receiver, trade.senderTokenId);
        IERC721(nftContractAddress).safeTransferFrom(trade.receiver, trade.sender, trade.receiverTokenId);
        
        trades[_tradeId].isTradeOpen = false;
        emit TradeUpdated(_tradeId, "accepted");
    }

    function rejectTradeRequest(uint256 _tradeId) public {
        Trade memory trade = trades[_tradeId];
        require(trade.isTradeOpen == true, "Trade is not open");
        require(trade.receiver == msg.sender, "Only trade receiver can reject trade");

        trades[_tradeId].isTradeOpen = false;
        emit TradeUpdated(_tradeId, "rejected");
    }

    function cancelTradeRequest(uint256 _tradeId) public {
        Trade memory trade = trades[_tradeId];
        require(trade.isTradeOpen == true, "Trade is not open");
        require(trade.sender == msg.sender, "Only trade requester can cancel trade");

        trades[_tradeId].isTradeOpen = false;
        emit TradeUpdated(_tradeId, "canceled");
    }

    function queryTradeRequest(uint256 _tradeId) public view returns (address, address, uint256, uint256, bool) {
        require(_tradeId <= tradeId.current(), "Querying a trade that doesn't exist");
        Trade memory trade = trades[_tradeId];
        return (trade.sender, trade.receiver, trade.senderTokenId, trade.receiverTokenId, trade.isTradeOpen);
    }
}