import { Button } from "frames.js/next";
import { TESTNET_ENABLED } from "../client";
import { Heading } from "../components/heading";
import { frames } from "./frames";

const handler = frames(async () => {
  return {
    image: (
      <div tw="flex flex-col">
        <Heading>ENS Tools</Heading>
        <div tw="flex">
          Manage your ENS names {TESTNET_ENABLED ? "(on Sepolia)" : ""}
        </div>
      </div>
    ),
    textInput: "Search for an ENS name",
    buttons: [
      <Button action="post" target="/check-names">
        or check your connected addresses
      </Button>,
    ],
  };
});

export const GET = handler;
export const POST = handler;
