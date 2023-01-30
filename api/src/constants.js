
    import * as USDT from "./abis/xUSDT.json" assert {type: "json"};
    import * as USDC from "./abis/xUSDC.json" assert {type: "json"};
    import * as cUSD from "./abis/cUSD.json" assert {type: "json"};
    import * as cEUR from "./abis/cEUR.json" assert {type: "json"};

export const TOKENS = {
    USDT: {address: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832", decimals: 6},
    cUSD: {address: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832", decimals: 6},
    cEUR: {address: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832", decimals: 6},
    WMATIC: {address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", decimals: 18},
    TTK: {address: "0x1645CB0CE4a7Bcfc25e20117564A9d79FC10078C", decimals: 18}
}

export const AUTO_YIELD_ABI = {
    USDC,
    USDT,
    cUSD,
    cEUR
}

export const TOKENKEY = ["USDT", "cUSD", "cEUR", "WMATIC", "TTK"];
