import ethers from "ethers";
import dotenv from "dotenv";
import { CeloProvider, CeloWallet} from '@celo-tools/celo-ethers-wrapper'

dotenv.config({path: ".env.local"});

export const getSigner = () => {
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY);

    const provider = new ethers.providers.AlchemyProvider(
        "optimism-goerli",
        process.env.PROVIDER_KEY
    );

    const signer = wallet.connect(provider);
    
    return signer;
}

export const getCeloSigner = async () => {

    const provider = new CeloProvider('https://alfajores-forno.celo-testnet.org');

    await provider.ready;

    const signer = new CeloWallet(process.env.WALLET_PRIVATE_KEY, provider);

    return signer;
}
