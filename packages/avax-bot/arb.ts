import 'dotenv/config';
import config from './config';
import { ethers } from 'ethers';
import { abi as PangolinRouterABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/PangolinRouter.sol/PangolinRouter.json';

import TraderJoeRouterABI from '@traderjoe-xyz/core/abi/JoeRouter02.json';
import { tokens } from './tokens.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.AVAX_RPC_URL);
const joeRouter = new ethers.Contract(config.joeRouter, TraderJoeRouterABI, provider);
const pngRouter = new ethers.Contract(config.pngRouter, PangolinRouterABI, provider);

interface ArbOp {
  token: string;
  symbol: string;
  address: string;
  joePrice: number;
  pngPrice: number;
  baseToken: string;
}

// An arbitrage opportunity occurs if the price of AVAX is different between the two DEXes. 
// An arbitrageur would flash borrow AVAX from the lower priced DEX and sell it for USDT on the higher priced DEX,
// then pay back the borrow using USDT (this is allowed for flash swaps - more on this below).
// When the prices are off by a significant margin, do the following in a single transaction:
// Borrow AVAX from the lower priced pair using flash swaps
// Sell AVAX on the higher priced pair for USDT
// Pay back USDT on the lower priced pair
// Collect profit
// GetAmountsIn() you call this function to get figure out how BUSD you would need to get n BNB . 
// GetAmountOut() will return how much amtOut you would get for a x amt of amtIn.

/*
  GetAmountsOutRes * PriceOfTokenOut = PriceOfTokenOut
  tokenPath: [tokenIn, tokenOut]
*/
async function lpInfo(tokenPath: string[], exchange: string, decimals: number) : Promise<number> {
  const tokenInAmount  = ethers.utils.parseEther("1").toString();

  var amtOut;
  try {
    switch (exchange) {
      case 'joe':
        amtOut = await joeRouter.getAmountsOut(tokenInAmount, tokenPath);
        break;
      case 'png':
        amtOut = await pngRouter.getAmountsOut(tokenInAmount, tokenPath);
        break;
      default:
        break;
    }
  } catch (e: unknown) {
    return 0;
  }

  return Number(ethers.utils.formatUnits(amtOut[1], decimals));
}

async function calcNetProfit() {
  const gasPrice = await provider.getGasPrice();
  const readableGas = ethers.utils.formatEther(gasPrice);
  console.log(`gas:` + readableGas);
}

async function findOps() {
}

async function isProfitable(joePrice: number, pngPrice: number) {
  console.log((Math.max(joePrice, pngPrice) - Math.min(joePrice, pngPrice)))
  return (joePrice != pngPrice && (Math.max(joePrice, pngPrice) - Math.min(joePrice, pngPrice)) > .01);
}

async function main() {
  provider.on('block', async (blockNumber) => {
    // see if we can do this in parallel later
    Object.keys(config.baseTokens).forEach(async key => {

      var tokenOut = config.baseTokens[key];

      tokens.forEach(async tkn => {
        var tokenIn = tkn.address;
        var tokenPath = [tokenIn, tokenOut.address];
        var decimals = tokenOut.decimals;

        var joePrice = await lpInfo(tokenPath, 'joe', decimals);
        var pngPrice = await lpInfo(tokenPath, 'png', decimals);

        if (await isProfitable(joePrice, pngPrice)) {
          // call our contract appropriately 
          // log the pair, prices of each exchange
          var arbOp: ArbOp = {
            token: tkn.name,
            symbol: tkn.symbol,
            address: tkn.address,
            joePrice: joePrice,
            pngPrice: pngPrice,
            baseToken: key
          } ;
          console.log(arbOp)
        }
      });
    });
  });
}

main();

// {
//   token: 'Wrapped BTC',
//   symbol: 'WBTC.e',
//   address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
//   joePrice: 171512.7853186049,
//   pngPrice: 13524.151932363502,
//   baseToken: 'wavax'
// }