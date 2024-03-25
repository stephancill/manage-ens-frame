import { Button } from "frames.js/next";
import { frames } from "./frames";
import { Heading } from "../components/heading";
import { serializeJsx } from "../renderImage";
import { imageUrl } from "../utils";

const handler = frames(async () => {
  return {
    image: (
      <div tw="flex flex-col">
        {" "}
        <Heading>ENS Tools</Heading>
        <div>Manage your ENS names</div>
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
