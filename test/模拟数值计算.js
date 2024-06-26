// const _lpTokens = 50;
// const ethAmount = (_lpTokens * getEthReserve()) / totalSupply();
const tokenAmount = getAmount(33.333333333333336,getEthReserve(),getTokenReserve());
// const tokenAmount = (getTokenReserve() * _lpTokens) / totalSupply();
// console.log(ethAmount);
console.log(tokenAmount);
// const ethAmount =  getAmount(100, getTokenReserve(), getEthReserve());
// console.log(ethAmount);
function getEthReserve(){
    return 100;
}

function getTokenReserve(){
    return 200;
}

function totalSupply(){
    return 100;
}

function getAmount(xIn, x, y){
       const _amount = (xIn * y) / (x + xIn);
       return _amount;
}

