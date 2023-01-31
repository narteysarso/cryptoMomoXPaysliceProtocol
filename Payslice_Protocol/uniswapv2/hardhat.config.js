require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "alfajores",
  namedAccounts: {
    deployer: 0
  },
  networks: {
    alfajores: {
      url: process.env.ALFAJORE_FERNO_RPC,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey:{
      alfajores: process.env.CELO_SCAN_API_KEY
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io/"
        }
      }
    ]
  }
};
