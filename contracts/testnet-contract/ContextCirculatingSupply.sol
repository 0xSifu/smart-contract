// SPDX-License-Identifier: AGPL-3.0-or-later\
pragma solidity 0.7.5;

import './interfaces/IERC20.sol';

import './libraries/SafeMath.sol';

contract ContextCirculatingSupply {
    using SafeMath for uint256;

    bool public isInitialized;

    address public CTXT;
    address public owner;
    address[] public nonCirculatingCTXTAddresses;

    constructor(address _owner) {
        owner = _owner;
    }

    function initialize(address _ctxt) external returns (bool) {
        require(msg.sender == owner, 'caller is not owner');
        require(isInitialized == false);

        CTXT = _ctxt;

        isInitialized = true;

        return true;
    }

    function CTXTCirculatingSupply() external view returns (uint256) {
        uint256 _totalSupply = IERC20(CTXT).totalSupply();

        uint256 _circulatingSupply = _totalSupply.sub(getNonCirculatingCTXT());

        return _circulatingSupply;
    }

    function getNonCirculatingCTXT() public view returns (uint256) {
        uint256 _nonCirculatingCTXT;

        for (
            uint256 i = 0;
            i < nonCirculatingCTXTAddresses.length;
            i = i.add(1)
        ) {
            _nonCirculatingCTXT = _nonCirculatingCTXT.add(
                IERC20(CTXT).balanceOf(nonCirculatingCTXTAddresses[i])
            );
        }

        return _nonCirculatingCTXT;
    }

    function setNonCirculatingCTXTAddresses(
        address[] calldata _nonCirculatingAddresses
    ) external returns (bool) {
        require(msg.sender == owner, 'Sender is not owner');
        nonCirculatingCTXTAddresses = _nonCirculatingAddresses;

        return true;
    }

    function transferOwnership(address _owner) external returns (bool) {
        require(msg.sender == owner, 'Sender is not owner');

        owner = _owner;

        return true;
    }
}
