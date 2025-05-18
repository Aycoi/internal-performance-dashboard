"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, Link } from "lucide-react"

export function GoogleSheetsConnector() {
  const [sheetUrl, setSheetUrl] = useState("")
  const [connected, setConnected] = useState(false)

  const handleConnect = () => {
    // In a real implementation, this would authenticate with Google Sheets API
    // and store the connection details
    if (sheetUrl) {
      setConnected(true)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {connected ? "Manage Data Sources" : "Connect Google Sheets"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Google Sheets</DialogTitle>
          <DialogDescription>
            Enter the URL of your Google Sheet to connect it as a data source for the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-url" className="col-span-4">
              Google Sheet URL
            </Label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="col-span-4"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleConnect}>
            <Link className="mr-2 h-4 w-4" />
            Connect Sheet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
