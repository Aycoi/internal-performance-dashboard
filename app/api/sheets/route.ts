import { NextResponse } from "next/server"
import { google } from "googleapis"

// Mock data to use as fallback
const mockData = {
  monthlyData: [
    { month: "Sep", income: 12800, target: 14000, hours: 85, hourTarget: 100, operational: 20 },
    { month: "Oct", income: 10500, target: 14000, hours: 75, hourTarget: 100, operational: 15 },
    { month: "Nov", income: 13700, target: 14000, hours: 90, hourTarget: 100, operational: 25 },
    { month: "Dec", income: 14100, target: 14000, hours: 95, hourTarget: 100, operational: 25 },
    { month: "Jan", income: 15800, target: 14000, hours: 110, hourTarget: 100, operational: 35 },
    { month: "Feb", income: 14900, target: 14000, hours: 105, hourTarget: 100, operational: 30 },
    { month: "Mar", income: 11300, target: 14000, hours: 80, hourTarget: 100, operational: 17 },
    { month: "Apr", income: 9800, target: 14000, hours: 70, hourTarget: 100, operational: 14 },
  ],
  serviceData: [
    { name: "Studio Rental", value: 65 },
    { name: "Equipment Rental", value: 20 },
    { name: "Post-Production", value: 10 },
    { name: "Workshops", value: 5 },
  ],
  marketingData: [
    { name: "Campaign 1", spent: 799, leads: 82, cpl: 9.74, profileVisits: 468 },
    { name: "Campaign 2", spent: 850, leads: 65, cpl: 13.08, profileVisits: 320 },
    { name: "Campaign 3", spent: 799, leads: 125, cpl: 6.39, profileVisits: 412 },
  ],
}

export async function GET(request: Request) {
  // Check if we should use mock data (for testing)
  const { searchParams } = new URL(request.url)
  const useMock = searchParams.get("mock") === "true"

  // For health checks, return minimal data
  if (searchParams.get("health") === "true") {
    return NextResponse.json({
      status: "ok",
      monthlyData: mockData.monthlyData,
      serviceData: mockData.serviceData,
      marketingData: mockData.marketingData,
    })
  }

  // If mock is requested, return mock data
  if (useMock) {
    return NextResponse.json(mockData)
  }

  try {
    // Check required environment variables
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.FINANCIAL_SHEET_ID
    ) {
      console.warn("Missing required environment variables, falling back to mock data")
      return NextResponse.json({
        ...mockData,
        _note: "Using mock data due to missing environment variables",
      })
    }

    // Initialize auth
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Initialize sheets API
    const sheets = google.sheets({ version: "v4", auth })

    // Get financial data
    const financialResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.FINANCIAL_SHEET_ID,
      range: "Monthly!A2:G", // Adjust based on your sheet structure
    })

    // Transform the raw data
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
      spreadsheetId: process.env.FINANCIAL_SHEET_ID,
      range: "Services!A2:B", // Adjust based on your sheet structure
    })

    const serviceRows = serviceResponse.data.values
    const serviceData =
      serviceRows?.map((row) => ({
        name: row[0],
        value: Number.parseInt(row[1]),
      })) || []

    // Get marketing data
    const marketingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.MARKETING_SHEET_ID || process.env.FINANCIAL_SHEET_ID,
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

    // Return mock data as fallback with error info
    return NextResponse.json({
      ...mockData,
      _error: {
        message: error.message,
        code: error.code,
      },
      _note: "Using mock data due to API error",
    })
  }
}
