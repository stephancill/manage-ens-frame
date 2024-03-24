import { farcasterHubContext } from "frames.js/middleware";
import { createFrames } from "frames.js/next";

export const frames = createFrames({
  basePath: "/frames",
  middleware: [farcasterHubContext({ hubHttpUrl: process.env.HUB_HTTP_URL })],
});
