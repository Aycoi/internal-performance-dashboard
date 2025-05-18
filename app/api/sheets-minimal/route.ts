import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Step 1: Log that we're starting
    console.log("Starting minimal Google Sheets API test")

    // Step 2: Check environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      return NextResponse.json({ error: "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL" }, { status: 500 })
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_PRIVATE_KEY" }, { status: 500 })
    }

    if (!process.env.FINANCIAL_SHEET_ID) {
      return NextResponse.json({ error: "Missing FINANCIAL_SHEET_ID" }, { status: 500 })
    }

    // Step 3: Create auth client
    console.log("Creating auth client")
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Step 4: Initialize sheets API
    console.log("Initializing Google Sheets API")
    const sheets = google.sheets({ version: "v4", auth })

    // Step 5: Try to get spreadsheet metadata (not content)
    console.log("Fetching spreadsheet metadata")
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.FINANCIAL_SHEET_ID,
      fields: "properties/title,sheets/properties/title",
    })

    // Step 6: Return success with basic info
    return NextResponse.json({
      success: true,
      spreadsheetTitle: spreadsheetInfo.data.properties?.title,
      sheets: spreadsheetInfo.data.sheets?.map((sheet) => sheet.properties?.title),
    })
  } catch (error) {
    // Log the full error for debugging
    console.error("Google Sheets API Error:", error)

    // Return a structured error response
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.errors?.[0]?.message || "No detailed error information",
      },
      { status: 500 },
    )
  }
}
