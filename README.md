uniswapv1

只支持eth和token互换

1.先准备个token

2.Exchange 合约，处理eth和token的兑换

公式：x*y = k

(x+△x)(y-△y)=k

池子里多token，就要拿出eth

根据新进来的token，计算该得到多少eth（反之亦然）

xy-x△y+△xy-△x△y=xy
(x+△x)△y=△xy

3.根据这个公式，写出获取新数量的方法
△y=△xy/(x+△x)

y就是eth余额
x就是token余额

4.添加流动性

将eth和token存入合约
eth payable就行，调用的时候传入value
token从合约调用者转入合约，tranform就行（需要先approve，需要由代币所有者去approve）

这里探讨下合约approve为什么不得行，approve方法内部操作的是allowance，owner是取的msg.sender，如果合约调用，那么msg.sender就是合约，而合约是没钱的吧，合约要有钱，只能token所有者直接transfer点钱给合约，而transfer方法只能传to对象，就是谁调用就是谁的钱，操作不了别人的钱。

这里再探讨下黑客approve后为啥可以转走钱，approve后，恶意合约就可以操作一定额度的你的代币了，再调用恶意合约的方法，里面进行transferFrom，from地址传受害者的地址，to地址给黑客的地址，amount不超过授权数量，就转走了。

5.编写swap方法
eth换token，转入eth，转出token
这里获取eth余额有个要注意，△y=△xy/(x+△x)，公式中总量是指原量，而eth立马就转进去了，需要用最新总量-转入的eth得到原总量

token换eth
用户转token到合约，合约转eth出去

6.以后每次添加流动性，需要与池子成比例
根据转入的eth数量，计算该得到多少，若转入的token数量<这个数，就报错，最后不将用户提供的所有token都转入，而是只转该得的那部分


7.给LP提供者的奖励机制
发行LP代币，具体发多少怎么算的
这里有个简单的公式，保证（lp的本次mint数量和lp总量的比）始终等于（本次存入的eth的数量和eth总量的比）amountMinted = (msg.value*totalSupply)/address(this).balance
LP的作用是将来取回流动性，作销毁用

8.这里LP发放的逻辑有了，接下来还需要给LP提供者一比小费，这个怎么收取呢？
直接在△y=△xy/(x+△x)这个公式里，把入库数量△x少掉0.01，这样预期得到的△y就少了，等于是被收走了1%的手续费，那这个收付费是收到合约里，这里怎么对LP提供者产生效益呢？
在这之前，我们先把移除流动性的代码写了吧

9.移除流动性
根据给定LP数量去移除
根据LP数量与eth数量的比例，可以计算出拿回的eth数量，根据eth数量，计算出token数量
1.burn LP
2.转账eth到msg.sender
3.转账token到msg.sender

我们需要来一套过程演练，先简单点，我们有一个池子，一个LP提供者，一个用户


工厂合约
1.记录交易对
2.获取交易对
3.部署交易对

token1-token2交易

每个exchange都应该保存factory--msg.sender

token1换eth
获取到token2 exchange地址
将eth换为token2

eth2token方法微调，使token2分发对象变为指定的，原来固定为合约调用者



