import { frames } from "../frames";
import { NextRequest } from "next/server";
import { handleManageImpl } from "./handleManageImpl";

export const POST = frames(handleManageImpl);
