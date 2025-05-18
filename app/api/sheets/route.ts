import { NextResponse } from "next/server"
import { google } from "googleapis"

// This would be set in your environment variables
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY

// Your Google Sheet IDs - each tab/data source can have its own sheet or be on the same sheet
const FINANCIAL_SHEET_ID = process.env.FINANCIAL_SHEET_ID
const BOOKINGS_SHEET_ID = process.env.BOOKINGS_SHEET_ID
const MARKETING_SHEET_ID = process.env.MARKETING_SHEET_ID

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Auth with Google
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Get financial data
    const financialResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: FINANCIAL_SHEET_ID,
      range: "Monthly!A2:G", // Adjust based on your sheet structure
    })

    // Transform the raw data into the format needed for the dashboard
    const financialRows = financialResponse.data.values
    const monthlyData =
      financialRows?.map((row) => ({
        month: row[0],
        income: Number.parseInt(row[1]),
        target: Number.parseInt(row[2]),
        hours: Number.parseInt(row[3]),
        hourTarget: Number.parseInt(row[4]),
        operational: Number.parseInt(row[5]),
      })) || []

    // Get service breakdown data
    const serviceResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: FINANCIAL_SHEET_ID,
      range: "Services!A2:B", // Adjust based on your sheet structure
    })

    const serviceRows = serviceResponse.data.values
    const serviceData =
      serviceRows?.map((row) => ({
        name: row[0],
        value: Number.parseInt(row[1]),
      })) || []

    // Get marketing data if needed
    const marketingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: MARKETING_SHEET_ID,
      range: "Campaigns!A2:E", // Adjust based on your sheet structure
    })

    const marketingRows = marketingResponse.data.values
    const marketingData =
      marketingRows?.map((row) => ({
        name: row[0],
        spent: Number.parseInt(row[1]),
        leads: Number.parseInt(row[2]),
        cpl: Number.parseFloat(row[3]),
        profileVisits: Number.parseInt(row[4]),
      })) || []

    // Return all data
    return NextResponse.json({
      monthlyData,
      serviceData,
      marketingData,
    })
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error)
    return NextResponse.json({ error: "Failed to fetch data from Google Sheets" }, { status: 500 })
  }
}
