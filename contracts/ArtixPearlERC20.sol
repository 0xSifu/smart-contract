// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "./interfaces/IsARTIX.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeERC20.sol";
import "./libraries/Address.sol";
import "./types/ERC20.sol";

contract ArtixPearlERC20 is ERC20 {
    using SafeERC20 for ERC20;
    using Address for address;
    using SafeMath for uint;

    address public immutable sARTIX;

    constructor( address _sARTIX ) ERC20( 'Wrapped sARTIX', 'WAX', 18 ) {
        require( _sARTIX != address(0) );
        sARTIX = _sARTIX;
    }

    /**
        @notice wrap sARTIX
        @param _amount uint
        @return uint
     */
    function wrap( uint _amount ) external returns ( uint ) {
        IERC20( sARTIX ).transferFrom( msg.sender, address(this), _amount );

        uint value = sARTIXToWAX( _amount );
        _mint( msg.sender, value );
        return value;
    }

    /**
        @notice unwrap sARTIX
        @param _amount uint
        @return uint
     */
    function unwrap( uint _amount ) external returns ( uint ) {
        _burn( msg.sender, _amount );

        uint value = waxTosARTIX( _amount );
        IERC20( sARTIX ).transfer( msg.sender, value );
        return value;
    }

    /**
        @notice converts WAX amount to sARTIX
        @param _amount uint
        @return uint
     */
    function waxTosARTIX( uint _amount ) public view returns ( uint ) {
        return _amount.mul( IsARTIX( sARTIX ).index() ).div( 10 ** decimals() );
    }

    /**
        @notice converts sARTIX amount to WAX
        @param _amount uint
        @return uint
     */
    function sARTIXToWAX( uint _amount ) public view returns ( uint ) {
        return _amount.mul( 10 ** decimals() ).div( IsARTIX( sARTIX ).index() );
    }

}

