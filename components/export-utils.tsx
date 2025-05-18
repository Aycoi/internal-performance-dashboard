"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export async function exportToPDF(elementId: string, filename = "dashboard.pdf") {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(filename)
  } catch (error) {
    console.error("Error exporting to PDF:", error)
  }
}

export function exportToCSV(data: any[], filename = "data.csv") {
  // Convert object array to CSV string
  const headers = Object.keys(data[0]).join(",")
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
        .join(","),
    )
    .join("\n")

  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`
  const encodedUri = encodeURI(csvContent)

  // Create download link and trigger download
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
