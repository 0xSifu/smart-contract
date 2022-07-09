// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;


import "./interfaces/IERC20.sol";


contract ArtixStakingWarmup {

    address public immutable staking;
    address public immutable sARTIX;

    constructor ( address _staking, address _sARTIX ) {
        require( _staking != address(0) );
        staking = _staking;
        require( _sARTIX != address(0) );
        sARTIX = _sARTIX;
    }

    function retrieve( address _staker, uint _amount ) external {
        require( msg.sender == staking );
        IERC20( sARTIX ).transfer( _staker, _amount );
    }
}
