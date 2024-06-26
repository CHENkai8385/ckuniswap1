// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Factory.sol";

interface IFactory {
    function getPair(address _tokenAddress) external view returns (address);
}

interface IExchange {
    function swapEthForTokens(uint256 _minTokens) external payable;

    function swapEthForTokensByTransfer(uint256 _minTokens, address receiver) external payable;
}

contract Exchange is ERC20 {
    address public factoryAddress;
    address public tokenAddress;
    constructor(address _tokenAddress) ERC20("ExchangeTokenLP", "ETKLP"){
        tokenAddress = _tokenAddress;
        factoryAddress = msg.sender;
    }

    function addLiquidity(uint256 _tokenAmount) public payable {
        if (getTokenReserve() == 0) {
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            _mint(msg.sender, getEthReserve());
        } else {
            uint256 tokenAmount = getAmount(msg.value, getEthReserve() - msg.value, getTokenReserve());
            require(_tokenAmount >= tokenAmount, "Insufficient token amount");
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), tokenAmount);

            //发LP代币
            uint256 lpTokens = (msg.value * totalSupply()) / getEthReserve();
            _mint(msg.sender, lpTokens);
        }
    }

    function removeLiquidity(uint256 _lpTokens) public {
        require(_lpTokens > 0, "invalid amount");

        uint256 ethAmount = (_lpTokens * getEthReserve()) / totalSupply();
        uint256 tokenAmount = (_lpTokens * getTokenReserve()) / totalSupply();
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        payable(msg.sender).transfer(ethAmount);
        _burn(msg.sender, _lpTokens);
    }


    function ethToToken(uint256 _minTokens, address receiver) private {
        uint256 tokenReserve = getTokenReserve();
        uint256 tokensBought = getAmount(msg.value, getEthReserve() - msg.value, tokenReserve);
        require(tokensBought >= _minTokens, "Insufficient output amount");
        IERC20(tokenAddress).transfer(receiver, tokensBought);
    }

    function swapEthForTokens(uint256 _minTokens) public payable {
        ethToToken(_minTokens, msg.sender);
    }

    function swapEthForTokensByTransfer(uint256 _minTokens, address receiver) public payable {
        ethToToken(_minTokens, receiver);
    }

    function swapTokensForEth(uint256 _tokenAmount, uint256 _minEth) public returns (uint256){
        uint256 ethBought = getAmount(_tokenAmount, getTokenReserve(), getEthReserve());
        require(ethBought >= _minEth, "Insufficient output amount");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokenAmount);
        payable(msg.sender).transfer(ethBought);
        return ethBought;
    }

    function swapTokenForToken(address targetTokenAddress, uint256 _tokenAmount, uint256 _minTokensBought) public payable {
        address exchangeAddress = IFactory(factoryAddress).getPair(targetTokenAddress);
        require(exchangeAddress != address(0), "Invalid token address");
        //换eth(user将tokena通过本合约换为eth)
        uint256 ethBought = getAmount(_tokenAmount, getTokenReserve(), getEthReserve());
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _tokenAmount);
        //eth换目标token（找到tokenb，将eth换为tokenb，本合约转eth给tokenb的exchange合约，再将对应数量的tokenb转给user）
        IExchange(exchangeAddress).swapEthForTokensByTransfer{value: ethBought}(_minTokensBought, msg.sender);
    }

    function getEthReserve() public view returns (uint256){
        return address(this).balance;
    }

    function getTokenReserve() public view returns (uint256){
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function getTokenAmount(uint256 _ethSold) public view returns (uint256){
        return getAmount(_ethSold, getEthReserve(), getTokenReserve());
    }

    function getEthAmount(uint256 _tokenSold) public view returns (uint256){
        return getAmount(_tokenSold, getTokenReserve(), getEthReserve());
    }

    //△y=△xy/(x+△x)
    //        uint256 _amount = (xIn * y) / (x + xIn);
//        return _amount;
//        uint256 inputAmountWithFee = xIn * 99;
//        uint256 numerator = inputAmountWithFee * y;
//        uint256 denominator = (x * 100) + inputAmountWithFee;
    // 原公式就是xIn * 0.99 * y/(x+0.99*In) 分子分母同时乘以100，结果不变，变形为以下格式
    function getAmount(uint256 xIn, uint256 x, uint256 y) private pure returns (uint256){
        require(x > 0 && y > 0, "invalid reserves");
        uint256 numerator = xIn * 99 * y;
        uint256 denominator = (x * 100) + xIn * 99;
        return numerator / denominator;
    }
}
