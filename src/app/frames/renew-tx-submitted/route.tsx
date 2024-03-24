import { Execute } from "@reservoir0x/relay-sdk";
import { frames } from "../frames";
import { kv } from "@vercel/kv";

export const POST = frames(async (ctx) => {
  if (!ctx.message) {
    throw new Error("No message");
  }

  // Look up user's request in kv
  const stepsSerialized = await kv.get<string>(
    ctx.message.requesterFid.toString()
  );
  const steps: Execute["steps"] = JSON.parse(stepsSerialized!);

  const check = steps[0].items?.[0].check;

  // Call check endpoint and report progress

  return {
    image: "renew-success",
  };
});
