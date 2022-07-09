// SPDX-License-Identifier: AGPL-3.0-or-later\
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";

import "../libraries/SafeMath.sol";

contract ArtixCirculatingSupply {
    using SafeMath for uint;

    bool public isInitialized;

    address public ARTIX;
    address public owner;
    address[] public nonCirculatingARTIXAddresses;

    constructor( address _owner ) {
        owner = _owner;
    }

    function initialize( address _artix ) external returns ( bool ) {
        require( msg.sender == owner, "caller is not owner" );
        require( isInitialized == false );

        ARTIX = _artix;

        isInitialized = true;

        return true;
    }

    function ARTIXCirculatingSupply() external view returns ( uint ) {
        uint _totalSupply = IERC20( ARTIX ).totalSupply();

        uint _circulatingSupply = _totalSupply.sub( getNonCirculatingARTIX() );

        return _circulatingSupply;
    }

    function getNonCirculatingARTIX() public view returns ( uint ) {
        uint _nonCirculatingARTIX;

        for( uint i=0; i < nonCirculatingARTIXAddresses.length; i = i.add( 1 ) ) {
            _nonCirculatingARTIX = _nonCirculatingARTIX.add( IERC20( ARTIX ).balanceOf( nonCirculatingARTIXAddresses[i] ) );
        }

        return _nonCirculatingARTIX;
    }

    function setNonCirculatingARTIXAddresses( address[] calldata _nonCirculatingAddresses ) external returns ( bool ) {
        require( msg.sender == owner, "Sender is not owner" );
        nonCirculatingARTIXAddresses = _nonCirculatingAddresses;

        return true;
    }

    function transferOwnership( address _owner ) external returns ( bool ) {
        require( msg.sender == owner, "Sender is not owner" );

        owner = _owner;

        return true;
    }
}
