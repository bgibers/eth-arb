// const JoeFactoryAddress = '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10';
const JoeRouterAddress = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4';

// const PangolinFactoryAddress = '0xefa94DE7a4656D787667C749f7E1223D71E9FD88';
const PangolinRouterAddress = '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106';

interface Token {
  address: string;
  decimals: number
}

const baseTokens: {[key: string]: Token} = {
    'usdte' : { address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', decimals:  6 },
    'usdce' : { address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', decimals: 6 },
    'usdc' : { address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
    'usdt' : { address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
    'wavax' : { address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18 },
    'wethe' : { address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', decimals: 18 },
    'mim' : { address: '0x130966628846BFd36ff31a822705796e8cb8C18D', decimals: 18 },
    'usta' : { address: '0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11', decimals: 6 },
    'ustw' : { address:'0xb599c3590F42f8F995ECfa0f85D2980B76862fc1', decimals: 6 }
};

interface Config {
    contractAddr: string;
    joeRouter: string;
    pngRouter: string;
    baseTokens: {[key: string]: Token};
}

const config: Config = {
    contractAddr: '',
    joeRouter: JoeRouterAddress,
    pngRouter: PangolinRouterAddress,
    baseTokens: baseTokens
  };

  export default config;