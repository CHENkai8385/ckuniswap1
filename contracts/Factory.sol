// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Exchange.sol";

contract Factory {
    event PairCreated(address indexed tokenA, address pair);

    mapping(address => address) tokenPair;

    function getPair(address tokenA) public view returns (address) {
        require(tokenA != address(0), "Invalid token address");
        require(tokenPair[tokenA] != address(0), "Pair does not exist");
        return tokenPair[tokenA];
    }

    function createPair(address tokenA) public returns (address) {
        require(tokenA != address(0), "Invalid token address");
        require(tokenPair[tokenA] == address(0), "Pair already exists");
        tokenPair[tokenA] = address(new Exchange(tokenA));
        emit PairCreated(tokenA, tokenPair[tokenA]);
        return tokenPair[tokenA];
    }
}
