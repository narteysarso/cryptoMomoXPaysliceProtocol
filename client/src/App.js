
import './App.css';
import 'antd/dist/reset.css';
import '@rainbow-me/rainbowkit/styles.css';

import {
  connectorsForWallets,
  RainbowKitProvider,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";

import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import Home from './Home';

const [celo, alfajores] = [{
  id: 42220,
  name: 'Celo Mainnet',
  network: 'celo mainnet',
  iconUrl: process.env.REACT_APP_CELO_ICON,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: process.env.REACT_APP_CELO_RPC,
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://celoscan.io' },
    etherscan: { name: 'CeloScan', url: 'https://celoscan.io' },
  },
  testnet: false,
}, {
  id: 44787,
  name: 'Alfajores',
  network: 'alfajores',
  iconUrl: process.env.REACT_APP_CELO_ICON,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: process.env.REACT_APP_ALFAJORES_RPC,
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
    etherscan: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
  },
  testnet: true,
} ];

console.log(celo,alfajores);
const { chains, provider } = configureChains(
  [celo, alfajores],
  [jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) }), publicProvider()]
);


// const { chains, provider } = configureChains(
//   [chain.polygon, chain.polygonMumbai],
//   [
//     alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID }),
//     publicProvider()
//   ]
// );

// const connectors = connectorsForWallets([
//   {
//     groupName: "Recommended with CELO",
//     wallets: [
//       wallet.metaMask({ chains }),
//       wallet.walletConnect({ chains }),
//     ],
//   },
// ])

const { connectors } = getDefaultWallets({
  appName: 'CryptoMomo AirDrop',
  chains
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function App() {

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Home />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
