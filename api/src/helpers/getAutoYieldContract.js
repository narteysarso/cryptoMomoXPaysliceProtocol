import { ethers } from "ethers";
import { AUTO_YIELD_ABI } from "../constants.js";
import getSigner from "./signer.js";


export default (token) => {

    if (!AUTO_YIELD_ABI[token]) return null;

    const contract = new ethers.Contract(AUTO_YIELD_ABI[token].address, AUTO_YIELD_ABI[token].abi);

    const signer = getSigner();

    const contractWithSigner = contract.connect(signer);

    return contractWithSigner;
}