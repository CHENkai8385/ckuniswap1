const {expect} = require('chai');
const {ethers} = require("hardhat");
const {abi} = require("../artifacts/contracts/Exchange.sol/Exchange.json")

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function deployMyContract() {
    const myToken = await ethers.deployContract("MyToken", [300]);
    const yourToken = await ethers.deployContract("YourToken", [300]);
    //发布exchange，传入token地址，并传入2个eth
    // const myExchange = await ethers.deployContract("Exchange", [myToken.target]);
    const myFactory = await ethers.deployContract("Factory");

    const [owner, user1] = await ethers.getSigners();
    console.log("myToken", myToken.target);
    console.log("yourToken", yourToken.target);
    console.log("factory", myFactory.target);
    console.log("owner", owner.address);
    console.log("user1", user1.address);
    return {myToken, yourToken, myFactory, owner, user1};
}

describe('Factory', () => {
    beforeEach(async () => {
        const {myToken, yourToken, myFactory, owner, user1} = await loadFixture(deployMyContract);//
        this.myToken = myToken;
        this.yourToken = yourToken;
        this.myFactory = myFactory;
        this.owner = owner;
        this.user1 = user1;
    });
    it('should token to token', async () => {
        const myExchangeTansaction = await this.myFactory.createPair(this.myToken.target);

        const myExchangeReceipt = await myExchangeTansaction.wait();
        // console.log("myExchangeReceipt", myExchangeReceipt);
        // 从交易回执中获取Exchange合约的地址
        const myExchangeAddress = await this.myFactory.getPair(this.myToken.target);
            // myExchangeReceipt.events.find(event => event.event === 'PairCreated').args.pair;
        this.myExchange = new ethers.Contract(myExchangeAddress,abi,this.owner);
        console.log("myExchange", this.myExchange.target);
        const yourExchangeTansaction = await this.myFactory.createPair(this.yourToken.target);
        // console.log("yourExchangeTansaction", yourExchangeTansaction);
        const yourExchangeReceipt = await yourExchangeTansaction.wait();
        // 从交易回执中获取Exchange合约的地址
        const yourExchangeAddress = await this.myFactory.getPair(this.yourToken.target);
            // yourExchangeReceipt.events.find(event => event.event === 'PairCreated').args.pair;
        this.yourExchange = new ethers.Contract(yourExchangeAddress,abi,this.owner);
        console.log("yourExchange", this.yourExchange.target);

        console.log("owner提供100eth，200token流动性给myExchange之后：---------->");
        await this.myToken.approve(this.myExchange.target, ethers.parseEther("200"));
        await this.myExchange.addLiquidity(ethers.parseEther("200"), {value: ethers.parseEther("100")});
        console.log('LP提供者owner------------>');
        console.log('eth balance:', ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('mytoken balance:', ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('yourToken balance:', ethers.formatEther(await this.yourToken.balanceOf(this.owner)));
        console.log('lp1 balance:', ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('lp2 balance:', ethers.formatEther(await this.yourExchange.balanceOf(this.owner)));
        console.log('myExchange 合约池子------------>');
        console.log('eth balance:', ethers.formatEther(await this.myExchange.getEthReserve()));
        console.log('mytoken balance:', ethers.formatEther(await this.myExchange.getTokenReserve()));

        console.log("owner提供100eth，200token流动性给yourExchange之后：---------->");
        await this.yourToken.approve(this.yourExchange.target, ethers.parseEther("200"));
        await this.yourExchange.addLiquidity(ethers.parseEther("200"), {value: ethers.parseEther("100")});
        console.log('LP提供者owner------------>');
        console.log('eth balance:', ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('mytoken balance:', ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('yourToken balance:', ethers.formatEther(await this.yourToken.balanceOf(this.owner)));
        console.log('lp1 balance:', ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('lp2 balance:', ethers.formatEther(await this.yourExchange.balanceOf(this.owner)));
        console.log('yourExchange 合约池子------------>');
        console.log('eth balance:', ethers.formatEther(await this.yourExchange.getEthReserve()));
        console.log('yourExchange balance:', ethers.formatEther(await this.yourExchange.getTokenReserve()));

        console.log("owner从myexchage换100mytoken为100yourtoken：---------->");
        await this.myToken.approve(this.myExchange.target, ethers.parseEther("100"));
        await this.myExchange.swapTokenForToken(this.yourToken.target, ethers.parseEther("100"), ethers.parseEther("1"));
        console.log('LP提供者owner------------>');
        console.log('eth balance:', ethers.formatEther(await ethers.provider.getBalance(this.owner)));
        console.log('mytoken balance:', ethers.formatEther(await this.myToken.balanceOf(this.owner)));
        console.log('yourToken balance:', ethers.formatEther(await this.yourToken.balanceOf(this.owner)));
        console.log('lp1 balance:', ethers.formatEther(await this.myExchange.balanceOf(this.owner)));
        console.log('lp2 balance:', ethers.formatEther(await this.yourExchange.balanceOf(this.owner)));
        console.log('myExchange 合约池子------------>');
        console.log('eth balance:', ethers.formatEther(await this.myExchange.getEthReserve()));
        console.log('mytoken balance:', ethers.formatEther(await this.myExchange.getTokenReserve()));
        console.log('yourExchange 合约池子------------>');
        console.log('eth balance:', ethers.formatEther(await this.yourExchange.getEthReserve()));
        console.log('yourExchange balance:', ethers.formatEther(await this.yourExchange.getTokenReserve()));

    });
});
