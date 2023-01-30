import { TOKENS } from "../constants.js";
import { InvalidPropertyError } from "../helpers/errors.js";
import getWalletContract from "../helpers/getWalletContract.js";
import isValidPhonenumber from "../helpers/is-valid-phonenumber.js";
import { parseUnits } from "../helpers/utils.js";

const gasLimit = 700000;

export default function makeWalletList() {

    const createOrClaimWallet = async ({
        phonenumber
    }) => {
        const walletContract = getWalletContract();

        if (!isValidPhonenumber(phonenumber)) throw new InvalidPropertyError(
            `Invalid phonenumber`
        );

        const txn = await walletContract.createOrClaimWallet(phonenumber, { gasLimit });

        const result = await txn.wait();

        // TODO: prepare blockchain response
    }

    const transferTokensToAccount = async ({
        fromPhonenumber,
        toPhonenumber,
        token,
        amount = 0
    }) => {
        if (!amount) throw new InvalidPropertyError(
            `Amount must be greater than zero (0)`
        );;

        if (!isValidPhonenumber(fromPhonenumber)) throw new InvalidPropertyError(
            `Invalid from phonenumber`
        );

        if (!isValidPhonenumber(toPhonenumber)) throw new InvalidPropertyError(
            `Invalid to phonenumber`
        );

        const walletContract = getWalletContract();

        const txn = await walletContract.safeTransferToAccount(
            fromPhonenumber,
            toPhonenumber,
            token,
            amount
        );

        return await txn.wait();


        // TODO: prepare blockchain response

    }

    const transferTokensToAddress = async ({
        fromPhonenumber,
        toAddress,
        token,
        amount = 0
    }) => {
        if (!amount) throw new InvalidPropertyError(
            `Amount must be greater than zero (0)`
        );;

        if (!isValidPhonenumber(fromPhonenumber)) throw new InvalidPropertyError(
            `Invalid from phonenumber`
        );

        if (!TOKENS[token]) throw new InvalidPropertyError(
            `Token is not support`
        );

        const walletContract = getWalletContract();

        const txn = await walletContract.transferToAddress(
            fromPhonenumber,
            toAddress,
            TOKEN[token].address,
            parseUnits(amount, TOKENS[token].decimals)
        );

        const results = await txn.wait();

        // TODO: prepare blockchain response

    }

    const getWalletAddress = async ({
        phonenumber
    }) => {
        if (!isValidPhonenumber(phonenumber)) throw new InvalidPropertyError(
            `Invalid phonenumber`
        );

        const walletContract = getWalletContract();

        const result = await walletContract.addressOfPhonenumber(phonenumber);

        return result;
    }
    const balanceOf = async ({
        phonenumber,
        token
    }) => {
        if (!isValidPhonenumber(phonenumber)) throw new InvalidPropertyError(
            `Invalid phonenumber`
        );

        const walletContract = getWalletContract();

        const result = await walletContract.balanceOf(phonenumber, token);

        return result;
    }

    const approveAddress = async ({
        phonenumber,
        recipientAddress,
        token,
        amount
    }) => {
        if (!isValidPhonenumber(phonenumber)) throw new InvalidPropertyError(
            `Invalid phonenumber`
        );

        const walletContract = getWalletContract();

        const result = await walletContract.approve(phonenumber, recipientAddress, token, amount);

        return result;
    }

    const approvePhonenumber = async ({
        phonenumber,
        recipientPhonenumber,
        token,
        amount
    }) => {
        // if (!isValidPhonenumber(phonenumber)) throw new InvalidPropertyError(
        //     `Invalid phonenumber`
        // );
        // if (!isValidPhonenumber(recipientPhonenumber)) throw new InvalidPropertyError(
        //     `Invalid recipient phonenumber`
        // );

        const walletContract = getWalletContract();

        const result = await walletContract.approve(phonenumber, recipientPhonenumber, token, amount);

        return result;
    }

    return Object.freeze({
        createOrClaimWallet,
        transferTokensToAddress,
        transferTokensToAccount,
        getWalletAddress,
        approveAddress,
        approvePhonenumber,
        balanceOf
    })
}