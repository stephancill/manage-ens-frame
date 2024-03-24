import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  const frameMetadata = await fetchMetadata(
    new URL("/frames", process.env.APP_URL!)
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
