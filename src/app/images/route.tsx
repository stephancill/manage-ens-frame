import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { deserializeJsx } from "../renderImage";

export async function GET(req: NextRequest) {
  const serialized = req.nextUrl.searchParams.get("jsx");

  if (!serialized) {
    throw new Error("No jsx");
  }

  const jsx = deserializeJsx(JSON.parse(serialized!));

  return new ImageResponse(jsx, { width: 1146, height: 600 });
}
