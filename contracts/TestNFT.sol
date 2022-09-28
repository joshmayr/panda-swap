// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestNFT is ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIds;

    constructor() ERC721("Test NFT", "tNFT") {}

    function mint() public {
        _safeMint(msg.sender, tokenIds.current());
        tokenIds.increment();
    }
}
