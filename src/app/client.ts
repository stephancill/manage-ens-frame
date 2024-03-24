import { addEnsContracts } from "@ensdomains/ensjs";
import {
  MAINNET_RELAY_API,
  convertViemChainToRelayChain,
  createClient,
} from "@reservoir0x/relay-sdk";
import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const { TESTNET_ENABLED } = process.env;

export const mainnetWithEns = TESTNET_ENABLED
  ? addEnsContracts({
      ...sepolia,
      network: "sepolia",
    })
  : addEnsContracts({
      ...mainnet,
      network: "homestead",
    });

export const publicClient = createPublicClient({
  chain: mainnetWithEns,
  transport: http(),
});

export const reservoirClient = createClient({
  baseApiUrl: MAINNET_RELAY_API,
  source: "stephancill",
  chains: [
    TESTNET_ENABLED
      ? convertViemChainToRelayChain(sepolia)
      : convertViemChainToRelayChain(mainnet),
  ],
});
