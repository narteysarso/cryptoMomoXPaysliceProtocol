import {getCeloSigner} from "./signer.js";
import walletAbi  from "../abis/CryptoMomo.json" assert { type: "json" };
import exchangeAbi  from "../abis/exchange.json" assert { type: "json" };
import ethers  from "ethers";

export const getWalletContract = async () => {
    
   const signer = await getCeloSigner();
   
   const  contractWithSigner = new ethers.Contract(walletAbi.address, walletAbi.abi, signer);

   return contractWithSigner;
}

export const getExchangeContract = async () => {

   const signer = await getCeloSigner();

   const  contractWithSigner = new ethers.Contract(exchangeAbi.address, exchangeAbi.abi, signer);

   return contractWithSigner;
}
