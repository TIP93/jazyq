import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  return Response.json({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
  });
}