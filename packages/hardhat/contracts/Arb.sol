pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint amount) external;
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IBPair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

contract FlashArb is Ownable {

    bytes internal constant ZERO_BYTES = new bytes(0);
    uint internal constant ZERO_UINT = uint(0);

    constructor() {}

    function doTriagonalV4(
        uint amount,
        address[4] calldata path,
        address[3] calldata pairs
    ) external {
        (uint reserveIn, uint reserveOut) = getReserves(pairs[0], path[0], path[1]);
        uint amountB = getAmountOut(amount, reserveIn, reserveOut);

        (reserveIn, reserveOut) = getReserves(pairs[1], path[1], path[2]);
        uint amountC = getAmountOut(amountB, reserveIn, reserveOut);

        (reserveIn, reserveOut) = getReserves(pairs[2], path[2], path[3]);
        uint amountA = getAmountOut(amountC, reserveIn, reserveOut);

        require(amountA > amount, "BSwap::NO_DELTA");

        IERC20 token = IERC20(path[0]);

        uint startingBalance = token.balanceOf(address(this));

        token.transfer(pairs[0], amount);

        if (path[0] < path[1]) {
            IBPair(pairs[0]).swap(ZERO_UINT, amountB, pairs[1], ZERO_BYTES);
        } else {
            IBPair(pairs[0]).swap(amountB, ZERO_UINT, pairs[1], ZERO_BYTES);
        }

        if (path[1] < path[2]) {
            IBPair(pairs[1]).swap(ZERO_UINT, amountC, pairs[2], ZERO_BYTES);
        } else {
            IBPair(pairs[1]).swap(amountC, ZERO_UINT, pairs[2], ZERO_BYTES);
        }

        if (path[2] < path[3]) {
            IBPair(pairs[2]).swap(ZERO_UINT, amountA, address(this), ZERO_BYTES);
        } else {
            IBPair(pairs[2]).swap(amountA, ZERO_UINT, address(this), ZERO_BYTES);
        }

        require(token.balanceOf(address(this)) >= startingBalance, "BSwap::NET_LOSS");
    }

    function doDiagonalV4(
        uint amount,
        address[3] calldata path,
        address[2] calldata pairs
    ) external {
        (uint reserveIn, uint reserveOut) = getReserves(pairs[0], path[0], path[1]);
        uint amountB = getAmountOut(amount, reserveIn, reserveOut);

        (reserveIn, reserveOut) = getReserves(pairs[1], path[1], path[2]);
        uint amountA = getAmountOut(amountB, reserveIn, reserveOut);

        require(amountA > amount, "BSwap::NO_DELTA");

        IERC20 token = IERC20(path[0]);

        uint startingBalance = token.balanceOf(address(this));

        token.transfer(pairs[0], amount);

        if (path[0] < path[1]) {
            IBPair(pairs[0]).swap(ZERO_UINT, amountB, pairs[1], ZERO_BYTES);
        } else {
            IBPair(pairs[0]).swap(amountB, ZERO_UINT, pairs[1], ZERO_BYTES);
        }

        if (path[1] < path[2]) {
            IBPair(pairs[1]).swap(ZERO_UINT, amountA, address(this), ZERO_BYTES);
        } else {
            IBPair(pairs[1]).swap(amountA, ZERO_UINT, address(this), ZERO_BYTES);
        }

        require(token.balanceOf(address(this)) >= startingBalance, "BSwap::NET_LOSS");
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getReserves(address pair, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (uint reserve0, uint reserve1,) = IBPair(pair).getReserves();
        // Gas savings checking if tokenA < tokenB instead of sorting and assigning to intermediary
        (reserveA, reserveB) = tokenA < tokenB ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function withdraw(uint _amount, address _token, address _to) external onlyOwner {
        IERC20(_token).transfer(_to, _amount);
    }

}

