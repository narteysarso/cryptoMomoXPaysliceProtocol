// SPDX-License-Identifier: MIt

/// @author Nartey Kodjo-Sarso <narteysarso@gmail.com>
pragma solidity >=0.8.15;

interface IExchange {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to
    ) external returns (uint[] memory amounts);
}
