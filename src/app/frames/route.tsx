import { Button } from "frames.js/next";
import { Heading } from "../components/heading";
import { imageUrl } from "../utils";
import { frames } from "./frames";
import { TESTNET_ENABLED } from "../client";

const handler = frames(async () => {
  return {
    image: imageUrl(
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
