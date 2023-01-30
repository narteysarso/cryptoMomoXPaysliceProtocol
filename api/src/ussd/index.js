import  makeMenu  from "./ussd.js";
import  makeWalletList  from "../wallets/wallet-list.js";
import  makeAccountLists  from "../accounts/account-list.js";
import  tableland  from "../db/tableland.js";

const walletList = makeWalletList();
const accountList = makeAccountLists({database: tableland});

export const ussdMenu = makeMenu({walletList, accountList});

