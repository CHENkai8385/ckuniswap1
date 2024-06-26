// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("YourToken", "YTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
