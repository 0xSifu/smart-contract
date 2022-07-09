// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


import "../types/Ownable.sol";
import "../types/ERC20.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";


contract PreArtixSales is Ownable {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event SaleStarted( address indexed activator, uint256 timestamp );
  event SaleEnded( address indexed activator, uint256 timestamp );
  event SellerApproval( address indexed approver, address indexed seller, string indexed message );

  IERC20 public dai;

  IERC20 public pArtix;

  address private _saleProceedsAddress;

  uint256 public pArtixPrice;

  bool public initialized;

  mapping( address => bool ) public approvedBuyers;

  constructor() {}

  function initialize(
    address pArtix_,
    address dai_,
    uint256 pArtixPrice_,
    address saleProceedsAddress_
  ) external onlyOwner {
    require( !initialized );
    pArtix = IERC20( pArtix_ );
    dai = IERC20( dai_ );
    pArtixPrice = pArtixPrice_;
    _saleProceedsAddress = saleProceedsAddress_;
    initialized = true;
  }

  function setPreArtixPrice( uint256 newPreArtixPrice_ ) external onlyOwner() returns ( uint256 ) {
    pArtixPrice = newPreArtixPrice_;
    return pArtixPrice;
  }

  function _approveBuyer( address newBuyer_ ) internal onlyOwner() returns ( bool ) {
    approvedBuyers[newBuyer_] = true;
    return approvedBuyers[newBuyer_];
  }

  function approveBuyer( address newBuyer_ ) external onlyOwner() returns ( bool ) {
    return _approveBuyer( newBuyer_ );
  }

  function approveBuyers( address[] calldata newBuyers_ ) external onlyOwner() returns ( uint256 ) {
    for( uint256 iteration_ = 0; newBuyers_.length > iteration_; iteration_++ ) {
      _approveBuyer( newBuyers_[iteration_] );
    }
    return newBuyers_.length;
  }

  function _calculateAmountPurchased( uint256 amountPaid_ ) internal returns ( uint256 ) {
    return amountPaid_.mul( pArtixPrice );
  }

  function buyPreArtix( uint256 amountPaid_ ) external returns ( bool ) {
    require( approvedBuyers[msg.sender], "Buyer not approved." );
    uint256 pArtixAmountPurchased_ = _calculateAmountPurchased( amountPaid_ );
    dai.safeTransferFrom( msg.sender, _saleProceedsAddress, amountPaid_ );
    pArtix.safeTransfer( msg.sender, pArtixAmountPurchased_ );
    return true;
  }

  function withdrawTokens( address tokenToWithdraw_ ) external onlyOwner() returns ( bool ) {
    IERC20( tokenToWithdraw_ ).safeTransfer( msg.sender, IERC20( tokenToWithdraw_ ).balanceOf( address( this ) ) );
    return true;
  }
}
