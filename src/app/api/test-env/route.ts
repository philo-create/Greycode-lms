import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY || "";
  return NextResponse.json({ keyPrefix: key.substring(0, 10), length: key.length });
}
