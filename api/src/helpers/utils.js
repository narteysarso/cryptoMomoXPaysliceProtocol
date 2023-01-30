import ethers  from "ethers";

export const parseUnits = (amount, unit) => ethers.utils.parseUnits(amount, unit);

export const formatUnits = (amount, unit) => ethers.utils.formatUnits(amount, unit);
