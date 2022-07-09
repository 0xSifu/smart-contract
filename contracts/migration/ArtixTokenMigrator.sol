// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import 'hardhat/console.sol';

import '../interfaces/IERC20.sol';
import '../interfaces/IArtixTreasury.sol';

import '../types/Ownable.sol';
import '../types/ERC20.sol';

import '../libraries/SafeMath.sol';
import '../libraries/SafeERC20.sol';

interface IUniswapV2Router {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 lpMaiAmountDesired,
        uint256 lpOldArtixAmountDesired,
        uint256 lpMaiAmountMin,
        uint256 lpOldArtixAmountMin,
        address to,
        uint256 deadline
    )
        external
        returns (
            uint256 lpMaiAmount,
            uint256 lpOldArtixAmount,
            uint256 liquidity
        );

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 lpMaiAmountMin,
        uint256 lpOldArtixAmountMin,
        address to,
        uint256 deadline
    ) external returns (uint256 lpMaiAmount, uint256 lpOldArtixAmount);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB)
        external
        view
        returns (address pair);
}

contract ArtixTokenMigrator is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable oldARTIX;
    IERC20 public immutable newARTIX;
    IERC20 public immutable mai;
    IArtixTreasury public immutable oldTreasury;
    IArtixTreasury public immutable newTreasury;
    IUniswapV2Router public immutable quickRouter;
    IUniswapV2Factory public immutable quickFactory;

    uint8 public immutable convertRatio = 5;
    bool public artixMigrated;
    uint256 public oldSupply;

    constructor(
        address _oldARTIX,
        address _oldTreasury,
        address _quickRouter,
        address _quickFactory,
        address _newARTIX,
        address _newTreasury,
        address _mai
    ) {
        require(_oldARTIX != address(0));
        oldARTIX = IERC20(_oldARTIX);
        require(_oldTreasury != address(0));
        oldTreasury = IArtixTreasury(_oldTreasury);
        require(_quickRouter != address(0));
        quickRouter = IUniswapV2Router(_quickRouter);
        require(_quickFactory != address(0));
        quickFactory = IUniswapV2Factory(_quickFactory);
        require(_newARTIX != address(0));
        newARTIX = IERC20(_newARTIX);
        require(_newTreasury != address(0));
        newTreasury = IArtixTreasury(_newTreasury);
        require(_mai != address(0));
        mai = IERC20(_mai);
    }

    // /* ========== MIGRATION ========== */
    function migrate() external {
        require(artixMigrated);
        uint256 oldARTIXAmount = oldARTIX.balanceOf(msg.sender);

        require(oldARTIXAmount > 0);
        oldARTIX.transferFrom(msg.sender, address(this), oldARTIXAmount);

        uint256 maiAmount = oldARTIXAmount.mul(1e9);
        uint256 newARTIXAmountInLP = oldARTIXAmount.div(convertRatio);

        oldARTIX.safeApprove(address(oldTreasury), oldARTIXAmount);
        oldTreasury.withdraw(maiAmount, address(mai));

        mai.safeApprove(address(newTreasury), maiAmount);
        uint256 valueOfMai = oldTreasury.valueOfToken(address(mai), maiAmount);
        newTreasury.deposit(maiAmount, address(mai), valueOfMai);

        newARTIX.transfer(msg.sender, newARTIXAmountInLP);
    }

    /* ========== OWNABLE ========== */

    // migrate contracts
    function migrateContracts() external onlyOwner {
        artixMigrated = true;

        oldSupply = oldARTIX.totalSupply(); // log total supply at time of migration

        uint256 newARTIXTotalSupply = oldSupply.div(convertRatio);

        // withdraw old LP
        address oldPair = quickFactory.getPair(address(oldARTIX), address(mai));
        uint256 oldLPAmount = IERC20(oldPair).balanceOf(address(oldTreasury));
        oldTreasury.manage(oldPair, oldLPAmount);

        IERC20(oldPair).safeApprove(address(quickRouter), oldLPAmount);
        (uint256 lpMaiAmount, uint256 lpOldArtixAmount) = quickRouter
            .removeLiquidity(
                address(mai),
                address(oldARTIX),
                oldLPAmount,
                0,
                0,
                address(this),
                1000000000000
            );

        // burn old artixs
        oldARTIX.safeApprove(address(oldTreasury), lpOldArtixAmount);
        uint256 extraMaiAmount = lpOldArtixAmount * 1e9;
        oldTreasury.withdraw(extraMaiAmount, address(mai));

        // deposit mai from burned artixs to the new treasury
        mai.safeApprove(address(newTreasury), extraMaiAmount);
        newTreasury.deposit(
            extraMaiAmount,
            address(mai),
            newTreasury.valueOfToken(address(mai), extraMaiAmount)
        );

        // mint new ARTIXs from new treasury
        uint256 newARTIXAmountInLP = lpOldArtixAmount.div(convertRatio);
        newTreasury.mintRewards(address(this), newARTIXAmountInLP);

        mai.safeApprove(address(quickRouter), lpMaiAmount);
        newARTIX.safeApprove(address(quickRouter), newARTIXAmountInLP);
        quickRouter.addLiquidity(
            address(mai),
            address(newARTIX),
            lpMaiAmount,
            newARTIXAmountInLP,
            lpMaiAmount,
            newARTIXAmountInLP,
            address(newTreasury),
            100000000000
        );

        // Move mai reserve to new treasury
        uint256 excessReserves = oldTreasury.excessReserves().mul(1e9);
        oldTreasury.manage(address(mai), excessReserves);

        uint256 valueOfMai = oldTreasury.valueOfToken(
            address(mai),
            excessReserves
        );

        // Mint new ARTIX to migrator for migration
        mai.safeApprove(address(newTreasury), excessReserves);
        uint256 newARTIXMinted = newARTIXTotalSupply.sub(newARTIXAmountInLP).sub(1);
        uint256 profit = valueOfMai.sub(newARTIXMinted);
        newTreasury.deposit(excessReserves, address(mai), profit);
    }

    // Failsafe function to allow owner to withdraw funds sent directly to contract in case someone sends non-ohm tokens to the contract
    function withdrawToken(
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        require(tokenAddress != address(0), 'Token address cannot be 0x0');
        require(tokenAddress != address(oldARTIX), 'Cannot withdraw: old-ARTIX');
        require(amount > 0, 'Withdraw value must be greater than 0');
        if (recipient == address(0)) {
            recipient = msg.sender; // if no address is specified the value will will be withdrawn to Owner
        }

        IERC20 tokenContract = IERC20(tokenAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        if (amount > contractBalance) {
            amount = contractBalance; // set the withdrawal amount equal to balance within the account.
        }
        // transfer the token from address of this contract
        tokenContract.safeTransfer(recipient, amount);
    }
}
