import { fetchMetadata } from "frames.js/next";
import { vercelURL } from "./utils";

export async function generateMetadata() {
  const frameMetadata = await fetchMetadata(
    new URL("/frames", (vercelURL() || process.env.APP_URL)!)
  );

  return {
    title: "ENS Frame",
    description: "ENS Frame",
    other: frameMetadata,
  };
}

export default function Initial() {
  return <div>Manage ENS names</div>;
}
