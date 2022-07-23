// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import './interfaces/IERC20.sol';
import './interfaces/IContextStaking.sol';

contract ContextStakingHelper {
    address public immutable staking;
    address public immutable CTXT;

    constructor(address _staking, address _CTXT) {
        require(_staking != address(0));
        staking = _staking;
        require(_CTXT != address(0));
        CTXT = _CTXT;
    }

    function stake(uint256 _amount, address _recipient) external {
        IERC20(CTXT).transferFrom(msg.sender, address(this), _amount);
        IERC20(CTXT).approve(staking, _amount);
        IContextStaking(staking).stake(_amount, _recipient);
        IContextStaking(staking).claim(_recipient);
    }
}
