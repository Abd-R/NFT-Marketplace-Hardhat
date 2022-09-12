// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error PriceNotMet(address, uint256, uint256);
error NftAlreadyListed(address, uint256);
error NotApprovedForMarketplace();
error NotListed(address, uint256);
error PriceMustBeAboveZero();
error TransferFailed();
error NotNftOwner();
error NoProceeds();

contract NftMarketplace is ReentrancyGuard{

    // Events

    event ItemListed(
        address indexed seller, 
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // Modifiers

    modifier isNftOwner(
        address nftAddress,
        address spender, 
        uint256 tokenId
    )
    {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(owner != spender)
            revert NotNftOwner();
        _;
    }

    modifier notListed (
        address nftAddress, 
        uint256 tokenId
    )
    {
        if(s_listings[nftAddress][tokenId].price > 0)
            revert NftAlreadyListed(nftAddress, tokenId);
        _;
    }

    modifier isListed (
        address nftAddress, 
        uint256 tokenId
    )
    {
        if(s_listings[nftAddress][tokenId].price <= 0)
            revert NotListed(nftAddress, tokenId);
        _;
    }

    // Struct

    struct Listing {
        uint256 price;
        address seller;
    }

    // State Vars

    // Nft address => token id => listings
    mapping (address => mapping (uint256 => Listing)) private s_listings;
    // Seller => Amount Earned
    mapping (address => uint256) private s_proceeds;

    // Main Functions

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
    external
    notListed(
        nftAddress, 
        tokenId
    )
    isNftOwner(
        nftAddress,
        msg.sender,
        tokenId
    )
    {
        if(price <= 0)
            revert PriceMustBeAboveZero();
        IERC721 nft = IERC721(nftAddress);

        if(nft.getApproved(tokenId) != address(this))
            revert NotApprovedForMarketplace();

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    )
    nonReentrant
    isListed(
        nftAddress,
        tokenId
    )
    payable
    external
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if(listedItem.price > msg.value)
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);

        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }
    
    function cancelItem(
        address nftAddress,
        uint256 tokenId)
    external
    isNftOwner(
        nftAddress,
        msg.sender,
        tokenId
    )
    isListed(
        nftAddress,
        tokenId
    )
    {   // Listing will be deleted
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }
    
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
    external
    isNftOwner(
        nftAddress,
        msg.sender,
        tokenId
    )
    isListed(
        nftAddress,
        tokenId
    )
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }
    
    function withdrawProceeds()
    nonReentrant
    external
    {
        uint256 proceeds = s_proceeds[msg.sender];
        if(proceeds <= 0)
            revert NoProceeds();
        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if(!success)
            revert TransferFailed(); 

    }
    
    function getListings(
        address nftAddress,
        uint256 tokenId
    )  
    external
    view
    returns (
        Listing memory
    ) 
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(
        address seller
    )  
    external
    view
    returns (
        uint256
    ) 
    {
        return s_proceeds[seller];
    }
}