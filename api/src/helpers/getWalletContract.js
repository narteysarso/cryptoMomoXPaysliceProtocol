import {getCeloSigner} from "./signer.js";
import walletAbi  from "../abis/CryptoMomo.json" assert { type: "json" };
import ethers  from "ethers";

const getWalletContract = () => {
    
   const  contract = new ethers.Contract(walletAbi.address, walletAbi.abi);

   const signer = getCeloSigner();

   const contractWithSigner = contract.connect(signer);

   return contractWithSigner;
}

export default getWalletContract;