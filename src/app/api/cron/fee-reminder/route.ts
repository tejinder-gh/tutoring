import { checkFeesDue } from "@/lib/cron";
import { NextResponse } from "next/server";

// Vercel Cron Job: Run daily at 10:00 AM IST
// Add to vercel.json: { "crons": [{ "path": "/api/cron/fee-reminder", "schedule": "30 4 * * *" }] }
// Note: 4:30 UTC = 10:00 AM IST

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get("authorization");

  // In production, verify with CRON_SECRET
  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await checkFeesDue();
    return NextResponse.json({
      success: true,
      message: "Fee reminder cron job executed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}
