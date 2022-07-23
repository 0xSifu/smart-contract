// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import './interfaces/IERC20.sol';

contract ContextStakingWarmup {
    address public immutable staking;
    address public immutable sCTXT;

    constructor(address _staking, address _sCTXT) {
        require(_staking != address(0));
        staking = _staking;
        require(_sCTXT != address(0));
        sCTXT = _sCTXT;
    }

    function retrieve(address _staker, uint256 _amount) external {
        require(msg.sender == staking);
        IERC20(sCTXT).transfer(_staker, _amount);
    }
}
