/**
 * Google Sheets API Authentication Setup Instructions
 *
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select an existing one
 * 3. Enable the Google Sheets API for your project
 * 4. Create Service Account credentials:
 *    - Go to "APIs & Services" > "Credentials"
 *    - Click "Create Credentials" > "Service Account"
 *    - Fill in details and grant appropriate roles
 *    - Create a new key (JSON type)
 *    - Download the JSON file
 *
 * 5. Share your Google Sheets with the service account email
 *    - Open your Google Sheet
 *    - Click "Share"
 *    - Add the service account email (from the JSON file)
 *    - Give it "Viewer" access (or Editor if you need to write back)
 *
 * 6. Add environment variables to your Vercel project:
 *    GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account-email@project-id.iam.gserviceaccount.com
 *    GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
 *    FINANCIAL_SHEET_ID=your-google-sheet-id
 *    BOOKINGS_SHEET_ID=your-google-sheet-id (could be same as financial)
 *    MARKETING_SHEET_ID=your-google-sheet-id (could be same as financial)
 *
 * Note: Make sure to properly escape the private key for environment variables
 */
