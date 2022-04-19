import 'dotenv/config';
import { JoeRouterAddress, JoeFactoryAddress, joe, wavax, pangolin, PangolinFactoryAddress, savax, PangolinRouterAddress} from './config';
import { ethers } from 'ethers';
import { abi as PangolinPairABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinPair.sol/PangolinPair.json';
import { abi as PangolinFactoryABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinFactory.sol/PangolinFactory.json';
import { abi as PangolinRouterABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/PangolinRouter.sol/PangolinRouter.json';

import TraderJoeFactoryABI from '@traderjoe-xyz/core/abi/JoeFactory.json';
import TraderJoePairABI from '@traderjoe-xyz/core/abi/JoePair.json';
import TraderJoeRouterABI from '@traderjoe-xyz/core/abi/JoeRouter02.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.AVAX_RPC_URL);
const traderJoeFactory = new ethers.Contract(JoeFactoryAddress, TraderJoeFactoryABI, provider);
const pangolinFactory = new ethers.Contract(PangolinFactoryAddress, PangolinFactoryABI, provider);
const joeRouter = new ethers.Contract(JoeRouterAddress, TraderJoeRouterABI, provider);
const pngRouter = new ethers.Contract(PangolinRouterAddress, PangolinRouterABI, provider);


// An arbitrage opportunity occurs if the price of AVAX is different between the two DEXes. 
// An arbitrageur would flash borrow AVAX from the lower priced DEX and sell it for USDT on the higher priced DEX,
// then pay back the borrow using USDT (this is allowed for flash swaps - more on this below).
// When the prices are off by a significant margin, do the following in a single transaction:
// Borrow AVAX from the lower priced pair using flash swaps
// Sell AVAX on the higher priced pair for USDT
// Pay back USDT on the lower priced pair
// Collect profit

/*
  We can get the exchange rate of a pool by dividing reserve0 by reserve1 and then adding slippage
*/
async function lpInfoTj(coin: string) : Promise<Number> {
    var pairAddress = traderJoeFactory.getPair(coin, wavax);
    var joePair = new ethers.Contract(pairAddress, TraderJoePairABI, provider);
    var reserves = await joePair.getReserves();

    return Number(price0) / Number(price1);
}

async function lpInfoPangolin(coin: string) : Promise<Number> {
  var pairAddress = pangolinFactory.getPair(coin, wavax);
  var pngPair = new ethers.Contract(pairAddress, PangolinPairABI, provider);

  var reserves = await pngPair.getReserves();
  var price0 = ethers.utils.formatUnits(reserves[0], 18);
  var price1 = ethers.utils.formatUnits(reserves[1], 18);

  return Number(price0) / Number(price1);
}

async function calcNetProfit() {
 const gasPrice = await provider.getGasPrice();
 const readableGas = ethers.utils.formatUnits(gasPrice, "ether");
 console.log(`gas:` + readableGas);

}

async function findOps() {
  // loop through all tokens
  // set higher val as pool0 and lower val as pool1
  // subtract pool0 from pool1 and then subtract gas
  // if profit then flashswap
}

async function main() {
  // for each block
  provider.on('block', async (blockNumber) => {
    console.log(`TJ:` + await lpInfoTj(joe));
    console.log(`PNG:` + await lpInfoPangolin(joe));
    calcNetProfit();
  });
}

main();