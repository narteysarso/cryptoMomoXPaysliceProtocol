
    import * as DAI from "./abis/DAI.json" assert {type: "json"};
    import * as USDC from "./abis/xUSDC.json" assert {type: "json"};
    import * as cUSD from "./abis/cUSD.json" assert {type: "json"};
    import * as cEUR from "./abis/cEUR.json" assert {type: "json"};
    import * as cDEFI from "./abis/CDEFI.json" assert {type: "json"};

export const TOKENS = {
    DAI: {address: "0x3BECa8cE2b6c18BB69669879865c213f13C9f902", decimals: 6},
    cUSD: {address: "0xE46AD6b17a4a5f8309e7004D5a246473F2f0DC1F", decimals: 6},
    cEUR: {address: "0x8369B70746C39F5707d9d60ca264b6C0Deefc8aD", decimals: 6},
    USDC: {address: "0x27258d7C77ccCBD988779a3Cd5BFA133dC639121", decimals: 6},
    cDEFI: {address: "0xD16324B00B0bD87af2182eB28C7FC941EE20ec75", decimals: 18}
}

export const AUTO_YIELD_ABI = {
    DAI,
    cDEFI,
    cUSD,
    cEUR,
    USDC,
}

export const TOKENKEY = ["USDC", "cUSD", "cEUR", "cDEFI", "DAI"];
