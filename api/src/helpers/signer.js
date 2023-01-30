const ethers = require("ethers");
require("dotenv").config({path: ".env.local"});

export const getSigner = () => {
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);

    const provider = new ethers.providers.AlchemyProvider(
        "optimism-goerli",
        process.env.PROVIDER_KEY
    );

    const signer = wallet.connect(provider);

    console.log(signer.address)
    return signer;
}

export const getCeloSigner = () => {
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);

    const provider = new ethers.providers.AlchemyProvider(
        "maticmum",
        process.env.PROVIDER_KEY
    );

    const signer = wallet.connect(provider);

    console.log(signer.address)
    return signer;
}
