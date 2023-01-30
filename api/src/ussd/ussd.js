import dotenv from "dotenv";
import africastalking from "africastalking";


import UssdMenu from 'ussd-builder';
import { TOKENS, TOKENKEY, AUTO_YIELD_ABI } from "../constants.js";
import { parseUnits, formatUnits } from "../helpers/utils.js";
import LocaleService from '../services/LocaleService.js';
import i18n from '../configs/i18n.config.js';

dotenv.config({ path: ".env.local" });

const Africatalking = africastalking({
    username: "sandbox",
    apiKey: process.env.AFRICASTALKING_API_KEY,
});


const sessions = {};

const makeMenu = ({ walletList, accountList, xendList } = {}) => {
    const localeService = new LocaleService(i18n);
    const sms = Africatalking.SMS;
    const menu = new UssdMenu();

    menu.sessionConfig({
        start: (sessionId, callback = () => { }) => {
            // initialize current session if it doesn't exist
            // this is called by menu.run()
            if (!(sessionId in sessions)) sessions[sessionId] = {};
            callback();
        },
        end: (sessionId, callback = () => { }) => {
            // clear current session
            // this is called by menu.end()
            delete sessions[sessionId];
            callback();
        },
        set: (sessionId, key, value, callback = () => { }) => {
            // store key-value pair in current session
            sessions[sessionId][key] = value;
            callback();
        },
        get: (sessionId, key, callback = () => { }) => {
            // retrieve value by key in current session
            let value = sessions[sessionId][key];
            callback(null, value);
        }
    });

    const authenticate = (message = 'Enter your pin', nextState, failState) => {
        return ({
            run: () => {
                menu.con(localeService.translate(message));
            },
            next: {
                // using regex to match user input to next state
                '*\\d{4,}': async () => {

                    const authenticated = await accountList.authenticate({ phonenumber: menu.args.phoneNumber, pin: menu.val });

                    if (!authenticated) return failState;

                    return nextState;
                }
            }
        })
    }

    const selectLanguage = (message = "Select a language", nextState, failState) => {
        return ({
            run: () => {
                menu.con(
                    `${localeService.translate(message)}:
                        \n1. عربي
                        \n2. English
                        \n3. Española
                        \n4. Français
                        \n5. Hausa
                        \n6. 普通话`
                );
            },
            next: {
                // using regex to match user input to next state
                '*[1-6]': async () => {
                    const languages = ["ar", "en", "es", "fr", "ha", "zn"];

                    const choice = languages[parseInt(menu.val) - 1];

                    if (!choice) return failState || menu.end();

                    menu.session.set("lang", choice);
                    return nextState;
                }
            }
        })
    }

    menu.startState({
        next: {
            "": async () => {
                // const session = getSession(menu.args.sessionId);
                const {lang} = await accountList.findLangByPhonenumber({ phonenumber: menu.args.phoneNumber });

                // dynamically switch to select langauge state or start start
                if (!lang)
                    return "selectLangauge"

                console.log(lang);

                menu.session.set("lang", lang);

                return "start"
            }
        }
    });

    menu.state("selectLangauge", selectLanguage("Select langauge", "start", "selectLanguage"));

    menu.state("wallet.language", selectLanguage("Select langauge", "wallet.language.update", "end"));

    menu.state("wallet.language.update", {
        run: async() =>{ 
            localeService.setLocale(await menu.session.get("lang") || "en");
            const account = await accountList.findByPhonenumber({phonenumber: menu.args.phoneNumber});

            if(!account) return menu.end(localeService.translate("Please register number"))

            const {lang, ...accountInfo} = account;
            
            const selectedLang = await menu.session.get("lang");

            menu.end(localeService.translate("Successfull"));
            
            console.log(account);

            await accountList.update({...accountInfo, lang: selectedLang });

            console.log("done")

            
        }
    });

    menu.state("start", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                `${localeService.translate("Welcome. Choose option")}:
                \n1. ${localeService.translate("Transfer Token")}
                \n2. ${localeService.translate("Swap Token")}
                \n3. ${localeService.translate("Finance Services")}
                \n4. ${localeService.translate("My wallet")}`
            );
        },

        next: {
            '1': "transfer",
            '2': 'swap',
            '3': 'finance',
            '4': 'wallet'
        }
    });

    menu.state("wallet", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                `${localeService.translate("My wallet")}:
                \n1. ${localeService.translate("Create or Claim Account")}
                \n2. ${localeService.translate("Check balance")}
                \n3. ${localeService.translate("Buy crypto")}
                \n4. ${localeService.translate("Get wallet address")}
                \n5. ${localeService.translate("Pending approvals")}
                \n6. ${localeService.translate("Choose language")}`
            );
        },
        next: {
            '1': async () => {
                const result = await accountList.findByPhonenumber({ phonenumber: menu.args.phoneNumber });
                if (result) return "createOrClaimAccount.authenticate";

                return "createOrClaimAccount.firstname"
            },
            '2': 'getTokenBalance.selectToken',
            '2': 'buyCrypto',
            '4': 'getAccountWalletAddress',
            '5': 'wallet.pendingApprovals',
            '6': 'wallet.language'
        }
    });

    menu.state("transfer", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                `${localeService.translate("Transfer Tokens")}:
                \n1. ${localeService.translate("Send Crypto")}
                \n2. ${localeService.translate("Bridge Token")}
            `);
        },
        next: {
            '1': 'sendCrypto.selectToken',
            '2': 'transfer.bridge',
        }
    });

    menu.state("savings.tokens", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Select Token') + ":" +
                '\n1. USDT' +
                '\n2. USDC'

            );
        },
        next: {
            "*[1-2]": "savings.list"
        }
    });

    menu.state("savings.list", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(`${localeService.translate("Saving options")}:
                \n1. ${localeService.translate("Check Balance")}
                \n2. ${localeService.translate("Deposit")}
                \n3. ${localeService.translate("Withdraw")}`
            );
        },
        next: {
            // using regex to match user input to next state
            '1': 'savings.balance',
            '2': 'savings.deposit',
            '3': 'savings.withdraw'
        }
    });

    menu.state("savings.balance", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            const [, , selectNumber,] = menu.args.text.split("*");
            const tokenKey = TOKENKEY[parseInt(selectNumber) - 1];

            const address = await walletList.getWalletAddress({ phonenumber: menu.args.phoneNumber });
            const balance = await xendList.balance(tokenKey, address);

            menu.end(`Savings balance is ${balance} ${tokenKey}`)
        }
    });

    menu.state("savings.deposit", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter amount'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d': 'savings.enterAmount'
        }
    });

    menu.state('savings.authenticate', authenticate("", "savings.save", "savings.authenticateFailed"));
    menu.state('savings.authenticateFailed', authenticate("Incorrect pin. Try again", "savings.save", "savings.authenticateFailed"));

    menu.state("savings.save", {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            const [, , selectNumber, , _amount] = menu.args.text.split("*");
            const tokenKey = TOKENKEY[parseInt(selectNumber) - 1];
            const token = TOKENS[tokenKey];

            if (!token) menu.end(localeService.translate("Incorrect token specified"));

            const amount = parseUnits(_amount, token.decimals)

            const balance = await walletList.balanceOf({ phonenumber: menu.args.phoneNumber, token: token.address });

            const recipientAddress = AUTO_YIELD_ABI[tokenKey].address;

            if (!recipientAddress) menu.end(localeService.translate("Wrong token selected"));
            if (!balance.gt(amount)) menu.end(`${localeService('Insufficient balance for')} ${tokenKey}`);

            menu.end(localeService.translate("Deposit processing"));

            await walletList.approveAddress({
                phonenumber: menu.args.phoneNumber.trim(),
                recipientAddress,
                token: token.address.trim(),
                amount
            });

            await xendList.deposit({ token: tokenKey, amount });

        }
    });

    menu.state('sendCrypto.selectToken', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                localeService.translate('Select Token') + ':\n' + TOKENKEY.reduce((acc, val, idx) => acc + `${idx + 1}: ${val} \n`, "")
            );
        },
        next: {
            // using regex to match user input to next state
            '*\\d': 'sendCrypto.enterAmount'
        }
    });

    menu.state('sendCrypto.enterAmount', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter amount'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d+': 'sendCrypto.recipientNumber'
        }
    });

    menu.state('sendCrypto.recipientNumber', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                localeService.translate('Enter recipient full phonenumber (no spaces)')
            );
        },
        next: {
            // using regex to match user input to next state
            '*\\+\\d{1,3}\\d{9}': 'sendCrypto.repeatNumber'
        }
    });

    menu.state('sendCrypto.repeatNumber', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                localeService.translate('Repeat phone number')
            );
        },
        next: {
            // using regex to match user input to next state
            '*\\+\\d{1,3}\\d{9}': async () => {
                const [, , , phonenumber] = menu.args.text.split("*");
                if (menu.val != phonenumber) return 'sendCrypto.repeatNumber';

                return 'sendCrypto.authenticate';
            }
        }
    });

    menu.state('sendCrypto.authenticate', authenticate("", "sendCrypto.amount", "sendCrypto.authenticateFailed"));
    menu.state('sendCrypto.authenticateFailed', authenticate("Incorrect pin. Try again", "sendCrypto.amount", "sendCrypto.authenticateFailed"));

    menu.state('sendCrypto.amount', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            const [, selectNumber, _amount, recipientPhonenumber] = menu.args.text.split("*");
            const tokenKey = TOKENKEY[parseInt(selectNumber) - 1];
            const token = TOKENS[tokenKey];

            if (!token) menu.end(localeService.translate("Incorrect token specified"));

            if (recipientPhonenumber === menu.args.phoneNumber) menu.end(localeService.translate("Invalid recipient phone number"))

            const amount = parseUnits(_amount, token.decimals)

            const balance = await walletList.balanceOf({ phonenumber: menu.args.phoneNumber, token: token.address });

            if (!balance.gt(amount)) menu.end(`${localeService.translate('Insufficient balance for')} ${tokenKey}`);

            menu.end(localeService.translate("Transfer is processing"));

            await walletList.transferTokensToAccount({
                fromPhonenumber: menu.args.phoneNumber.trim(),
                toPhonenumber: recipientPhonenumber.trim(),
                token: token.address.trim(),
                amount
            });
        }
    });

    menu.state('getTokenBalance.selectToken', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(
                localeService.translate('Select Token') + ':\n' + TOKENKEY.reduce((acc, val, idx) => acc + `${idx + 1}: ${val} \n`, "")
            );
        },
        next: {
            '*\\d': 'getTokenBalance.balance'
        }
    });

    menu.state('getTokenBalance.autheticate', authenticate("", "getTokenBalance.balance", "getTokenBalance.autheticateFailed"));

    menu.state('getTokenBalance.autheticateFailed', authenticate("Incorrect pin. Try again", "getTokenBalance.balance", "getTokenBalance.autheticateFailed"));

    menu.state('getTokenBalance.balance', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            const [, selectNumber,] = menu.args.text.split("*");
            const tokenKey = TOKENKEY[parseInt(selectNumber) - 1];

            const token = TOKENS[tokenKey];

            if (!token) menu.end(localeService.translate("Incorrect token specified"));

            const balance = await walletList.balanceOf({ phonenumber: menu.args.phoneNumber, token: token.address });

            const amount = formatUnits(balance, token.decimals);

            menu.end(`${localeService.translate('Balance is')} ${amount} ${tokenKey}`);

        }
    });

    menu.state('getAccountWalletAddress', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            const result = await walletList.getWalletAddress({ phonenumber: menu.args.phoneNumber });
            menu.end(`${localeService.translate('Account wallet address is')} ${result}`);

        }
    });

    menu.state('createOrClaimAccount.firstname', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter your first name'))
        },
        next: {
            // using regex to match user input to next state
            '*[a-zA-Z_0-9\-]{2,}': 'createOrClaimAccount.lastname'
        }
    });

    menu.state('createOrClaimAccount.lastname', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter your last name'))

        },
        next: {
            // using regex to match user input to next state
            '*[a-zA-Z_0-9\-]{2,}': 'createOrClaimAccount.lang'
        }
    });

    menu.state('createOrClaimAccount.lang', selectLanguage("Select langauge", "createOrClaimAccount.enterPin", "selectLanguage"));

    menu.state('createOrClaimAccount.enterPin', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter your pin (at least 4 characters)'))

        },
        next: {
            // using regex to match user input to next state
            '*\\d{4,}': 'createOrClaimAccount.confirmPin'
        }
    });

    menu.state('createOrClaimAccount.confirmPin', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter your pin again'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d{4,}': () => {
                
                const [, , , , , , pin] = menu.args.text.split("*");
                console.log(pin, menu.val, pin !== menu.val)
                if (pin !== menu.val) return "createOrClaimAccount.pinsDontMatch";

                return "createOrClaimAccount.register";
            }
        }
    });

    menu.state('createOrClaimAccount.pinsDontMatch', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Pins do not match. Confirm pin again'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d{4,}': () => {
                [, , , pin,] = menu.args.text.split("*");
                if (pin !== menu.val) return "createOrClaimAccount.pinsDontMatch";

                return "createOrClaimAccount.register";
            }
        }
    });

    menu.state('createOrClaimAccount.authenticate', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter your pin:'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d{4,}': async () => {

                const authenticated = await accountList.authenticate({ phonenumber: menu.args.phoneNumber, pin: menu.val });

                if (!authenticated) return "createOrClaimAccount.authenticationFailed";

                return "createOrClaimAccount.createWalletOnly";
            }
        }
    });

    menu.state('createOrClaimAccount.authenticationFailed', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Incorrect Pin. Try again:'))
        },
        next: {
            // using regex to match user input to next state
            '*\\d{4,}': async () => {

                const authenticated = await accountList.authenticate({ phonenumber: menu.args.phoneNumber, pin: menu.val });

                if (!authenticated) return "createOrClaimAccount.authenticationFailed";

                return "createOrClaimAccount.createWalletOnly";
            }
        }
    });

    menu.state('createOrClaimAccount.register', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.end(localeService.translate('Account is registered successfully'));
            console.log(menu.args.text.split("*"));
            const [, , ,firstname, lastname, lang, pin,] = menu.args.text.split("*");
            // console.log("inserting to database")
            const dbRes = await accountList.add({ pin, firstname, lastname, lang, phonenumber: menu.args.phoneNumber });
            // console.log(dbRes);
            // console.log("inserting to blockchain")
            const walletRes = await walletList.createOrClaimWallet({ phonenumber: menu.args.phoneNumber });
            // console.log(walletRes);
        }
    });

    menu.state('createOrClaimAccount.createWalletOnly', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.end(localeService.translate('Account is registered successfully'));

            const walletRes = await walletList.createOrClaimWallet({ phonenumber: menu.args.phoneNumber });

        }
    });

    menu.state('buyAirtime', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            menu.con(localeService.translate('Enter amount:'));
        },
        next: {
            // using regex to match user input to next state
            '*\\d+': 'buyAirtime.amount'
        }
    });

    // nesting states
    menu.state('buyAirtime.amount', {
        run: async () => {
            localeService.setLocale(await menu.session.get("lang") || "en");
            // use menu.val to access user input value
            var amount = Number(menu.val);
            buyAirtime(menu.args.phoneNumber, amount).then((res) => {
                menu.end('Airtime bought successfully.');
            });
        }
    });

    return menu;

}

export default makeMenu