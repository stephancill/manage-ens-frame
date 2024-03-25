import { Execute, paths } from "@reservoir0x/relay-sdk";
import { frames } from "../frames";
import { kv } from "@vercel/kv";
import { reservoirClient } from "../../client";
import { Button } from "frames.js/next";
import { imageUrl } from "../../utils";

type RelayStatusResponse =
  paths["/intents/status"]["get"]["responses"]["200"]["content"]["application/json"];

function getBlockExplorerTarget({
  txHash,
  fid,
  name,
}: {
  txHash: string;
  fid: string;
  name: string;
}) {
  const searchParams = new URLSearchParams({ fid, name });
  return {
    pathname: `/block-explorer/tx/${txHash}`,
    query: { back: `/renew-tx-submitted?${searchParams.toString()}` },
  };
}

export const handler = frames(async (ctx) => {
  try {
    let fid = ctx.searchParams.fid;
    const name = ctx.searchParams.name;

    if (!fid && !ctx.message) {
      throw new Error("No message");
    }

    if (!fid) {
      fid = ctx.message!.requesterFid.toString();
    }

    // Look up user's request in kv
    const steps = await kv.get<Execute["steps"]>(fid);

    const check = steps?.[0].items?.[0].check;

    if (!check?.endpoint) {
      console.error(
        "Could not find check endpoint on Relay",
        JSON.stringify(steps)
      );
      throw new Error("Could not find transaction on Relay");
    }

    // Call check endpoint and report progress
    const relayResponse = await fetch(
      new URL(check.endpoint, reservoirClient.baseApiUrl).toString()
    );
    if (relayResponse.status !== 200) {
      const data = await relayResponse.json();
      console.error(data);
      throw new Error(
        `Failed to execute call: ${data.message} status: ${relayResponse.status}`
      );
    }

    // Report progress
    const checkResult = (await relayResponse.json()) as RelayStatusResponse;

    console.log(JSON.stringify(checkResult));

    if (checkResult.status === "success") {
      return {
        image: imageUrl(<div tw="flex">Transaction successful!</div>),
        buttons: [
          <Button
            action="post"
            target={{ pathname: "/manage", query: { name } }}
          >
            ← Back to Manage
          </Button>,
          checkResult.inTxHashes?.[0] ? (
            <Button
              action="post"
              target={getBlockExplorerTarget({
                txHash: checkResult.inTxHashes[0],
                fid,
                name,
              })}
            >
              In tx ↗︎
            </Button>
          ) : null,
          checkResult.txHashes?.[0] ? (
            <Button
              action="post"
              target={getBlockExplorerTarget({
                txHash: checkResult.txHashes[0],
                fid,
                name,
              })}
            >
              Mainnet tx ↗︎
            </Button>
          ) : null,
        ],
      };
    } else if (
      checkResult.status === "pending" ||
      checkResult.status === "unknown"
    ) {
      return {
        image: imageUrl(
          <div tw="flex">
            Transaction in progress...{" "}
            {checkResult.details ? `(${checkResult.details})` : ""}
          </div>
        ),
        buttons: [
          <Button
            action="post"
            target={{ pathname: "/manage", query: { name } }}
          >
            ← Back to Manage
          </Button>,
          <Button
            action="post"
            target={{ pathname: "/renew-tx-submitted", query: { name } }}
          >
            ⟲ Check again
          </Button>,
          checkResult.inTxHashes?.[0] ? (
            <Button
              action="post"
              target={getBlockExplorerTarget({
                txHash: checkResult.inTxHashes[0],
                fid,
                name,
              })}
            >
              In tx ↗︎
            </Button>
          ) : null,
        ],
      };
    }

    return {
      image: imageUrl(<div tw="flex">Unknown transaction state</div>),
      buttons: [
        <Button
          action="post"
          target={{ pathname: "/renew-tx-submitted", query: { name } }}
        >
          ⟲ Check again
        </Button>,
      ],
    };
  } catch (error) {
    return {
      image: imageUrl(
        <div tw="flex">
          {typeof error === "object" && error && "message" in error
            ? (error.message as string)
            : "An error occurred"}{" "}
          - contact @stephancill on farcaster
        </div>
      ),
      buttons: [
        <Button action="post" target="/">
          ← Back
        </Button>,
      ],
    };
  }
});

export const GET = handler;
export const POST = handler;
