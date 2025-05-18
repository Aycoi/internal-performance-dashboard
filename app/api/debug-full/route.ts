import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    steps: [] as string[],
    errors: [] as any[],
    success: false,
    sheetInfo: null as any,
  }

  try {
    // Step 1: Check environment variables
    debugInfo.steps.push("Checking environment variables")

    const envVars = {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
      GOOGLE_PRIVATE_KEY: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      FINANCIAL_SHEET_ID: Boolean(process.env.FINANCIAL_SHEET_ID),
    }

    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
    }

    // Step 2: Check private key format
    debugInfo.steps.push("Checking private key format")
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || ""

    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      throw new Error("Private key appears to be malformed (missing BEGIN marker)")
    }

    if (!privateKey.includes("-----END PRIVATE KEY-----")) {
      throw new Error("Private key appears to be malformed (missing END marker)")
    }

    // Step 3: Initialize auth
    debugInfo.steps.push("Initializing authentication")
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Step 4: Test auth
    debugInfo.steps.push("Testing authentication")
    await auth.authorize()

    // Step 5: Initialize sheets API
    debugInfo.steps.push("Initializing Google Sheets API")
    const sheets = google.sheets({ version: "v4", auth })

    // Step 6: Get spreadsheet metadata
    debugInfo.steps.push("Fetching spreadsheet metadata")
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.FINANCIAL_SHEET_ID,
      fields: "properties/title,sheets/properties/title",
    })

    // Step 7: Try to get a small sample of data
    debugInfo.steps.push("Fetching sample data")
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.FINANCIAL_SHEET_ID,
      range: "A1:C5", // Just get a small sample
    })

    // Success!
    debugInfo.success = true
    debugInfo.sheetInfo = {
      title: spreadsheetInfo.data.properties?.title,
      sheets: spreadsheetInfo.data.sheets?.map((sheet) => sheet.properties?.title),
      sampleData: dataResponse.data.values,
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    // Capture the error
    debugInfo.errors.push({
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      details: error.errors?.[0]?.message || "No detailed error information",
    })

    return NextResponse.json(debugInfo, { status: 500 })
  }
}
