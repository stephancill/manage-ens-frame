import {
  RenewNamesDataParameters,
  RenewNamesDataReturnType,
} from "@ensdomains/ensjs/wallet";
import {
  ClientWithEns,
  bulkRenewalRenewAllSnippet,
  ethRegistrarControllerRenewSnippet,
  getChainContractAddress,
} from "@ensdomains/ensjs/contracts";
import { encodeFunctionData } from "viem";
import { UnsupportedNameTypeError } from "@ensdomains/ensjs";
import { getNameType } from "./getNameType";

export const makeRenewTxData = (
  publicClient: ClientWithEns,
  { nameOrNames, duration, value }: RenewNamesDataParameters
): RenewNamesDataReturnType => {
  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames];
  const labels = names.map((name) => {
    const label = name.split(".");
    const nameType = getNameType(name);
    if (nameType !== "eth-2ld")
      throw new UnsupportedNameTypeError({
        nameType,
        supportedNameTypes: ["eth-2ld"],
        details: "Only 2ld-eth renewals are currently supported",
      });
    return label[0];
  });

  if (labels.length === 1) {
    return {
      to: getChainContractAddress({
        client: publicClient,
        contract: "ensEthRegistrarController",
      }),
      data: encodeFunctionData({
        abi: ethRegistrarControllerRenewSnippet,
        functionName: "renew",
        args: [labels[0], BigInt(duration)],
      }),
      value,
    };
  }

  return {
    to: getChainContractAddress({
      client: publicClient,
      contract: "ensBulkRenewal",
    }),
    data: encodeFunctionData({
      abi: bulkRenewalRenewAllSnippet,
      functionName: "renewAll",
      args: [labels, BigInt(duration)],
    }),
    value,
  };
};
