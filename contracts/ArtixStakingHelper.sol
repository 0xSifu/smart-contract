// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import './interfaces/IERC20.sol';
import './interfaces/IArtixStaking.sol';

contract ArtixStakingHelper {
    address public immutable staking;
    address public immutable ARTIX;

    constructor(address _staking, address _ARTIX) {
        require(_staking != address(0));
        staking = _staking;
        require(_ARTIX != address(0));
        ARTIX = _ARTIX;
    }

    function stake(uint256 _amount, address _recipient) external {
        IERC20(ARTIX).transferFrom(msg.sender, address(this), _amount);
        IERC20(ARTIX).approve(staking, _amount);
        IArtixStaking(staking).stake(_amount, _recipient);
        IArtixStaking(staking).claim(_recipient);
    }
}
