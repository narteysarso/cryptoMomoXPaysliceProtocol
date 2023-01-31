const ethers = require('ethers');
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');

const { ForwarderAbi } = require('../../src/forwarder');
const { ERC20ABI } = require("../../src/ERC20");
const ForwarderAddress = require('../../deploy.json').MinimalForwarder;

async function estimateExecuteCost({forwarder, request, signature, payToken}) {
  // estimate gas cost for transaction
  const encodedFunctionData = forwarder.interface.encodeFunctionData("execute", [request, signature]);
  const gasPrice = await signer.getGasPrice();
  const gasRequired = await signer.estimateGas({
    to: forwarder.address,
    data: encodedFunctionData
  });

  const transactionCost = gasPrice.mul(gasRequired);

  const [transactionFee,] = await forwarder.gasCost(transactionCost, [payToken, await forwarder.feeToken]);
  
  return transactionFee;
}

async function relay({ forwarder, payTokenContract, request, signer, signature, paygasRequest, approvalRequest, whitelist } = {}) {
  
  // make gas payments and execute forward transaction
  if (paygasRequest && request && signature) {

    let txnCost = ethers.BigNumber.from(0);

    // Decide if we want to relay this request based on a whitelist
    const accepts = !whitelist || whitelist.includes(request.to);
    if (!accepts) throw new Error(`Rejected request to ${request.to}`);

    // Validate request on the forwarder contract
    const valid = await forwarder.verify(request, signature);
    if (!valid) throw new Error(`Invalid request`);

    console.log("Executing gas payment")

    const ownerBalance = await payTokenContract.balanceOf(paygasRequest.owner);
    console.log("balance", ownerBalance);

    if (ownerBalance < paygasRequest.value) throw new Error("Insufficient balance to pay for gas");

    // Send meta-tx through payslice to the forwarder contract
    const gasLimit = (parseInt(request.gas) + 50000).toString();

    const gasTxn = await forwarder.executeGasPayment(
      paygasRequest.payToken,
      paygasRequest.owner,
      paygasRequest.spender,
      paygasRequest.value,
      paygasRequest.deadline,
      paygasRequest.v,
      paygasRequest.r,
      paygasRequest.s
    );
    await gasTxn.wait();
    
    console.log("Gas payment complete")

    const txn = await forwarder.execute(request, signature, { gasLimit });
    const forwardRes = await txn.wait();

    // add transaction cost to total transanction cost
    txnCost.add(forwardRes?.effectiveGasPrice?.mul(forwardRes?.gasUsed || 1) || 0);
    return forwardRes;
  }

  // Execute meta transaction for approval if any
  if (approvalRequest) {
    console.log("Approving with meta txn");

    //NOTE: approval does not cost anything. THIS WILL CHANGE!!!
    const gasTxn = await forwarder.executeApproval(
      approvalRequest.payToken,
      approvalRequest.owner,
      approvalRequest.spender,
      approvalRequest.value,
      approvalRequest.deadline,
      approvalRequest.v,
      approvalRequest.r,
      approvalRequest.s
    );
    const txnRes = await gasTxn.wait();
    return txnRes;
  }
}

async function handler(event) {
  // Parse webhook payload
  if (!event.request || !event.request.body) throw new Error(`Missing payload`);
  
  const { request, signature, paygasRequest, approvalRequest } = event.request.body;
  console.log(`Relaying`, request);

  // Initialize Relayer provider and signer, and forwarder contract
  const credentials = { ...event };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  const forwarder = new ethers.Contract(ForwarderAddress, ForwarderAbi, signer);
  const payTokenContract = paygasRequest ?  new ethers.Contract(paygasRequest?.payToken, ERC20ABI, signer) : undefined;

  // Relay transaction!
  const tx = await relay({ forwarder, request, signature, payTokenContract, paygasRequest, approvalRequest });
  console.log(`Sent meta-tx: ${tx.hash}`);
  return tx;
}

module.exports = {
  handler,
  relay,
}