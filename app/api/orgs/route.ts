import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Organisation endpoint placeholder" }, { status: 501 });
}
