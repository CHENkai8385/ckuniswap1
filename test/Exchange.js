const {expect} = require('chai');
const {ethers} = require("hardhat");

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function deployMyContract() {
    const myToken = await ethers.deployContract("MyToken", [200]);
    //发布exchange，传入token地址，并传入2个eth
    const myExchange = await ethers.deployContract("Exchange", [myToken.target]);

    const [owner, user1] = await ethers.getSigners();
    console.log("token", myToken.target);
    console.log("exchange", myExchange.target);
    console.log("owner", owner.address);
    console.log("user1", user1.address);
    return {myToken, myExchange, owner, user1};
}

describe('Exchange', () => {
    beforeEach(async () => {
        const {myToken, myExchange, owner, user1} = await loadFixture(deployMyContract);//
        this.myToken = myToken;
        this.myExchange = myExchange;
        this.owner = owner;
        this.user1 = user1;
    });
    // it('should get eth reserve', async () => {
    //     const res = await this.myExchange.getEthReserve();
    //     expect(res).to.equal(ethers.parseEther("2"));
    // });
    // it('should get token address', async () => {
    //     const tokenAddress = await this.myExchange.tokenAddress();
    //     // console.log(tokenAddress);
    //     expect(tokenAddress).to.equal(this.myToken.target);
    // });
    // it('should get token reserve', async () => {
    //     //先给exchange转点token
    //     await this.myToken.transfer(this.myExchange.target, ethers.parseEther("20"));
    //     const res = await this.myExchange.getTokenReserve();
    //     expect(res).to.equal(ethers.parseEther("20"));
    // });
    it('test transaction progress', async () => {
        //提供100eth和200token流动性
        console.log("owner提供100eth，200token流动性之后：---------->");
        await this.myToken.approve(this.myExchange.target, ethers.parseEther("200"));
        await this.myExchange.addLiquidity(ethers.parseEther("200"), {value: ethers.parseEther("100")});
        console.log('LP提供者------------>');
        console.log('eth balance:', ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('token balance:',  ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('lp balance:',  ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('Exchange 合约池子------------>');
        console.log('eth balance:',  ethers.formatEther(await this.myExchange.getEthReserve()));
        console.log('token balance:',  ethers.formatEther(await this.myExchange.getTokenReserve()));

        console.log("user1兑换10eth之后----------->");
        await (this.myExchange.connect(this.user1)).swapEthForTokens(ethers.parseEther("18"), {value: ethers.parseEther("10")});
        console.log('LP提供者------------>');
        console.log('eth balance:',  ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('token balance:',  ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('lp balance:',  ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('Exchange 合约池子------------>');
        console.log('eth balance:',  ethers.formatEther(await this.myExchange.getEthReserve()));
        console.log('token balance:',  ethers.formatEther(await this.myExchange.getTokenReserve()));
        console.log('user1------------>');
        console.log('eth balance:',  ethers.formatEther(await ethers.provider.getBalance(this.user1)));
        console.log('token balance:',  ethers.formatEther(await this.myToken.balanceOf(this.user1)));


        console.log("owner移除全部流动性之后----------->");
        await this.myExchange.removeLiquidity(await this.myExchange.balanceOf(this.owner));
        console.log('LP提供者------------>');
        console.log('eth balance:',  ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('token balance:',  ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('lp balance:',  ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('Exchange 合约池子------------>');
        console.log('eth balance:',  ethers.formatEther(await this.myExchange.getEthReserve()));
        console.log('token balance:',  ethers.formatEther(await this.myExchange.getTokenReserve()));
        console.log('user1------------>');
        console.log('eth balance:',  ethers.formatEther(await ethers.provider.getBalance(this.user1)));
        console.log('token balance:',  ethers.formatEther(await this.myToken.balanceOf(this.user1)));
    });
});
