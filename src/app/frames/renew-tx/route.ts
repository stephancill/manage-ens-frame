import { kv } from "@vercel/kv";
import { TransactionTargetResponse, getFrameMessage } from "frames.js";
import { NextRequest } from "next/server";
import { mainnetWithEns } from "../../client";
import {
  calculateEnsRenewalAuto as calculateEnsRenewalAutoFund,
  createRelayCall,
} from "../../utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const frameMessage = await getFrameMessage(body);

  const name = req.nextUrl.searchParams.get("name");
  const years = parseInt(req.nextUrl.searchParams.get("years")!);

  if (!name) {
    throw new Error("No name");
  }

  if (!frameMessage) {
    throw new Error("No message");
  }

  const connectedAddress = frameMessage.connectedAddress;
  const fid = frameMessage.requesterFid?.toString();

  const { tx, fundsChainId } = await calculateEnsRenewalAutoFund({
    connectedAddress: connectedAddress!,
    name,
    renewalYears: years,
  });

  // Initiate cross-chain execution
  const { steps } = await createRelayCall({
    user: connectedAddress as `0x${string}`,
    txs: [
      {
        ...tx,
        value: tx.value.toString(),
      },
    ],
    originChainId: fundsChainId,
    destinationChainId: mainnetWithEns.id,
    source: "stephancill",
  });

  // Save steps to kv if it's a transaction request
  if (frameMessage) await kv.set(fid!, JSON.stringify(steps));

  const relayTxData = steps[0].items?.[0].data;

  const txResponse: TransactionTargetResponse = {
    chainId: `eip155:${fundsChainId}`,
    method: "eth_sendTransaction",
    params: {
      abi: [],
      to: relayTxData.to,
      value: relayTxData.value,
      data: relayTxData.data,
    },
  };

  return Response.json(txResponse);
}
