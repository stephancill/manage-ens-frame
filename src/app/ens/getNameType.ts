// Source: @ensdomains/ensjs/utils/getNameType
export type TldNameSpecifier = "tld";
export type Eth2ldNameSpecifier = "eth-2ld";
export type EthSubnameSpecifier = "eth-subname";
export type Other2ldNameSpecifier = "other-2ld";
export type OtherSubnameSpecifier = "other-subname";
export type RootNameSpecifier = "root";
export type EthTldNameSpecifier = "eth-tld";

export type NameType =
  | TldNameSpecifier
  | Eth2ldNameSpecifier
  | EthSubnameSpecifier
  | Other2ldNameSpecifier
  | OtherSubnameSpecifier
  | RootNameSpecifier
  | EthTldNameSpecifier;

export const getNameType = (name: string): NameType => {
  const labels = name.split(".");
  const isDotEth = labels[labels.length - 1] === "eth";

  if (labels.length === 0) return "root";
  if (labels.length === 1) {
    if (isDotEth) return "eth-tld";
    return "tld";
  }
  if (labels.length === 2) {
    if (isDotEth) return "eth-2ld";
    return "other-2ld";
  }
  if (isDotEth) return "eth-subname";
  return "other-subname";
};
