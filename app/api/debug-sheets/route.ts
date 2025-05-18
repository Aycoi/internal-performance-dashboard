import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic environment variable check
    const envCheck = {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
      GOOGLE_PRIVATE_KEY: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      FINANCIAL_SHEET_ID: Boolean(process.env.FINANCIAL_SHEET_ID),
      BOOKINGS_SHEET_ID: Boolean(process.env.BOOKINGS_SHEET_ID),
      MARKETING_SHEET_ID: Boolean(process.env.MARKETING_SHEET_ID),
    }

    // Check if any env vars are missing
    const missingVars = Object.entries(envCheck)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    return NextResponse.json({
      status: "API endpoint reachable",
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
      },
      envVarsPresent: envCheck,
      missingVars: missingVars.length > 0 ? missingVars : null,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
