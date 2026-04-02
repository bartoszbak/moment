import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Photos list endpoint placeholder" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "Photo create endpoint placeholder" }, { status: 501 });
}
