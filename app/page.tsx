"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, Calendar, ClipboardList, DollarSign, FileSpreadsheet, Layers, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"
import { exportToPDF, exportToCSV } from "@/components/export-utils"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState({
    monthlyData: [],
    serviceData: [],
    marketingData: [],
  })
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 8, 1),
    to: new Date(2025, 3, 30),
  })
  const [compareMode, setCompareMode] = useState(false)
  const [compareRange, setCompareRange] = useState({
    from: new Date(2023, 8, 1),
    to: new Date(2024, 3, 30),
  })

  // Fetch data function
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Format dates for API
      const startDate = dateRange.from.toISOString().split("T")[0]
      const endDate = dateRange.to.toISOString().split("T")[0]

      // Optional comparison dates
      const compareParams = compareMode
        ? `&compareStartDate=${compareRange.from.toISOString().split("T")[0]}&compareEndDate=${compareRange.to.toISOString().split("T")[0]}`
        : ""

      const response = await fetch(`/api/sheets?startDate=${startDate}&endDate=${endDate}${compareParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError("Error loading dashboard data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and when date ranges change
  useEffect(() => {
    fetchData()
  }, [dateRange, compareMode, compareRange])

  // Apply button handler
  const handleApplyDateRange = (primary, comparison = null) => {
    setDateRange(primary)
    if (comparison) {
      setCompareRange(comparison)
    }
    // Will trigger the useEffect
  }

  // Mock data - this would come from Google Sheets API in a real implementation
  const monthlyData = data.monthlyData
  //   [
  //   { month: "Sep", income: 12800, target: 14000, hours: 85, hourTarget: 100, operational: 20 },
  //   { month: "Oct", income: 10500, target: 14000, hours: 75, hourTarget: 100, operational: 15 },
  //   { month: "Nov", income: 13700, target: 14000, hours: 90, hourTarget: 100, operational: 25 },
  //   { month: "Dec", income: 14100, target: 14000, hours: 95, hourTarget: 100, operational: 25 },
  //   { month: "Jan", income: 15800, target: 14000, hours: 110, hourTarget: 100, operational: 35 },
  //   { month: "Feb", income: 14900, target: 14000, hours: 105, hourTarget: 100, operational: 30 },
  //   { month: "Mar", income: 11300, target: 14000, hours: 80, hourTarget: 100, operational: 17 },
  //   { month: "Apr", income: 9800, target: 14000, hours: 70, hourTarget: 100, operational: 14 },
  // ]

  const comparisonData = compareMode
    ? [
        { month: "Sep", income: 9800, target: 12000, hours: 70, hourTarget: 85, operational: 15 },
        { month: "Oct", income: 8500, target: 12000, hours: 65, hourTarget: 85, operational: 12 },
        { month: "Nov", income: 10700, target: 12000, hours: 75, hourTarget: 85, operational: 20 },
        { month: "Dec", income: 11100, target: 12000, hours: 80, hourTarget: 85, operational: 22 },
        { month: "Jan", income: 12800, target: 12000, hours: 90, hourTarget: 85, operational: 28 },
        { month: "Feb", income: 11900, target: 12000, hours: 85, hourTarget: 85, operational: 25 },
        { month: "Mar", income: 9300, target: 12000, hours: 70, hourTarget: 85, operational: 15 },
        { month: "Apr", income: 7800, target: 12000, hours: 60, hourTarget: 85, operational: 12 },
      ]
    : []

  const serviceData = data.serviceData
  //   [
  //   { name: "Studio Rental", value: 65 },
  //   { name: "Equipment Rental", value: 20 },
  //   { name: "Post-Production", value: 10 },
  //   { name: "Workshops", value: 5 },
  // ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Calculate totals and averages
  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0)
  const totalHours = monthlyData.reduce((sum, item) => sum + item.hours, 0)
  const totalTarget = monthlyData.reduce((sum, item) => sum + item.target, 0)
  const totalHourTarget = monthlyData.reduce((sum, item) => sum + item.hourTarget, 0)

  const incomeVsTarget = totalIncome >= totalTarget
  const hoursVsTarget = totalHours >= totalHourTarget

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8" id="dashboard-content">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Frame Studio Performance Report</h1>
            <h2 className="text-xl font-semibold text-muted-foreground">تقرير أداء فريم ستديو</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-[260px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Sept 2024 - April 2025</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Date Range</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setCompareMode(!compareMode)}
                    >
                      {compareMode ? "Disable Compare" : "Compare Periods"}
                    </Button>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Primary Period</p>
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(date) => {
                        if (date?.from && date?.to) {
                          handleApplyDateRange({ from: date.from, to: date.to })
                        }
                      }}
                      initialFocus
                    />
                    {compareMode && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs text-muted-foreground">Comparison Period</p>
                        <CalendarComponent
                          mode="range"
                          selected={{
                            from: compareRange.from,
                            to: compareRange.to,
                          }}
                          onSelect={(date) => {
                            if (date?.from && date?.to) {
                              handleApplyDateRange(
                                { from: dateRange.from, to: dateRange.to },
                                { from: date.from, to: date.to },
                              )
                            }
                          }}
                          className="border-t pt-4"
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button size="sm">Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {compareMode && (
              <Badge variant="outline" className="ml-2">
                Comparing with Previous Year
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncome.toLocaleString()} SAR</div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">vs {totalTarget.toLocaleString()} SAR Target</p>
                <Badge variant={incomeVsTarget ? "default" : "destructive"} className="ml-auto">
                  {incomeVsTarget ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs((totalIncome / totalTarget - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Booked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours} hours</div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">vs {totalHourTarget} hours Target</p>
                <Badge variant={hoursVsTarget ? "default" : "destructive"} className="ml-auto">
                  {hoursVsTarget ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs((totalHours / totalHourTarget - 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Monthly Income</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totalIncome / monthlyData.length).toLocaleString()} SAR
              </div>
              <p className="text-xs text-muted-foreground">vs 14,000 SAR Target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Utilization</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35%</div>
              <p className="text-xs text-muted-foreground">In January 2025</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Total Income vs Target</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-md shadow-md p-3">
                            <p className="font-medium">{label}</p>
                            <div className="space-y-1 mt-2">
                              {payload.map((entry, index) => (
                                <div key={`tooltip-${index}`} className="flex items-center">
                                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }} />
                                  <span className="text-sm">{entry.name}: </span>
                                  <span className="text-sm font-medium ml-1">{entry.value.toLocaleString()} SAR</span>
                                </div>
                              ))}
                              {payload.length >= 2 && (
                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                  {payload[0].value >= payload[1].value
                                    ? `${((payload[0].value / payload[1].value - 1) * 100).toFixed(1)}% above target`
                                    : `${((1 - payload[0].value / payload[1].value) * 100).toFixed(1)}% below target`}
                                </div>
                              )}

                              {/* Show comparison with previous period if available */}
                              {compareMode && comparisonData.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                  {label && comparisonData.find((d) => d.month === label) && (
                                    <div>
                                      Previous year:{" "}
                                      {comparisonData.find((d) => d.month === label)?.income.toLocaleString()} SAR
                                      <div>
                                        {payload[0].value > comparisonData.find((d) => d.month === label)?.income
                                          ? `+${((payload[0].value / comparisonData.find((d) => d.month === label)?.income - 1) * 100).toFixed(1)}% YoY`
                                          : `-${((1 - payload[0].value / comparisonData.find((d) => d.month === label)?.income) * 100).toFixed(1)}% YoY`}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} name="Income (SAR)" />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target (SAR)" strokeDasharray="5 5" />
                  {compareMode && (
                    <Line
                      type="monotone"
                      data={comparisonData}
                      dataKey="income"
                      stroke="#ff7300"
                      name="Previous Year Income"
                      strokeDasharray="3 3"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Hours Booked vs Target</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-md shadow-md p-3">
                            <p className="font-medium">{label}</p>
                            <div className="space-y-1 mt-2">
                              {payload.map((entry, index) => (
                                <div key={`tooltip-${index}`} className="flex items-center">
                                  <div className="w-3 h-3 mr-2" style={{ backgroundColor: entry.color }} />
                                  <span className="text-sm">{entry.name}: </span>
                                  <span className="text-sm font-medium ml-1">{entry.value.toLocaleString()} hours</span>
                                </div>
                              ))}
                              <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                                {payload[0].value >= payload[1].value
                                  ? `${((payload[0].value / payload[1].value - 1) * 100).toFixed(1)}% above target`
                                  : `${((1 - payload[0].value / payload[1].value) * 100).toFixed(1)}% below target`}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} name="Hours Booked" />
                  <Line
                    type="monotone"
                    dataKey="hourTarget"
                    stroke="#82ca9d"
                    name="Target Hours"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Revenue Breakdown by Service</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => {
                      // Calculate the SAR value based on percentage of total income
                      const sarValue = Math.round(totalIncome * percent)
                      return `${name}: ${(percent * 100).toFixed(0)}% (${sarValue.toLocaleString()} SAR)`
                    }}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const percent = value / 100
                      const sarValue = Math.round(totalIncome * percent)
                      return [`${value}% (${sarValue.toLocaleString()} SAR)`, name]
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Operational % per Month</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-md shadow-md p-3">
                            <p className="font-medium">{label}</p>
                            <div className="space-y-1 mt-2">
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-2" style={{ backgroundColor: payload[0].color }} />
                                <span className="text-sm">Utilization: </span>
                                <span className="text-sm font-medium ml-1">{payload[0].value}%</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {payload[0].value < 20
                                  ? "Low utilization"
                                  : payload[0].value < 30
                                    ? "Medium utilization"
                                    : "High utilization"}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="operational" fill="#82ca9d" name="Operational %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Operational Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md">
              <div className="space-y-4 p-4">
                <div>
                  <h3 className="text-lg font-semibold">Key Observations</h3>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      Highest utilization was in January (35%) and February (30%) -&gt; Strong performance, potentially
                      high demand period.
                    </li>
                    <li>Lowest utilization happened in April (14%) and October (15%) -&gt; Very low usage.</li>
                    <li>March (17%) -&gt; Significant drop after February.</li>
                    <li>Dec and Nov (~25%) -&gt; Stable mid-tier usage.</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold">Observations</h3>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      The studio never exceeded 35% utilization -&gt; Big capacity available for additional business or
                      offers.
                    </li>
                    <li>
                      Seasonality or demand dips are visible (March + April) -&gt; possibly affected by market
                      conditions, weather, or campaigns.
                    </li>
                    <li>There is consistent space to grow bookings across all months.</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold">Recommendations</h3>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      Off-Peak Promotions (March-April + October): Introduce discounted slots or packages to push usage.
                    </li>
                    <li>Community Building & Loyalty Programs: Engage top clients or creators in special programs.</li>
                    <li>Dynamic Pricing: Adjust pricing based on occupancy rates.</li>
                    <li>Better Weekday Usage: Boost weekday occupancy with corporate or training rentals.</li>
                    <li>
                      Content creation / Marketing push for slow months: Increase ads focused on event season or content
                      production.
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold">Marketing & Feedback Overview</h3>
                  <div className="mt-2 space-y-4">
                    <div>
                      <h4 className="font-medium">Instagram Campaigns:</h4>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Most spent ~800 SAR per campaign.</li>
                        <li>Cost per lead ranged from 6 to 13 SAR.</li>
                        <li>Best performance: 468 profile visits for 799 SAR.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Customer Feedback:</h4>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Most users discovered the studio via Instagram.</li>
                        <li>High satisfaction with speed, setup, and service.</li>
                        <li>Average rating: 4.5-5 stars.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block border-l w-[300px]">
        <div className="p-6">
          <h3 className="font-medium text-lg mb-4">Data Sources</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>Studio Bookings (Google Sheet)</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-blue-500" />
              <span>Financial Data (Google Sheet)</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-amber-500" />
              <span>Marketing Campaigns (Google Sheet)</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 text-red-500" />
              <span>Customer Feedback (Google Sheet)</span>
            </li>
          </ul>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Growth Phase Goals</h3>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Hours Target:</span>
                    <span className="text-sm">1,800 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Average:</span>
                    <span className="text-sm">100 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Revenue Target:</span>
                    <span className="text-sm">252,000 SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Average:</span>
                    <span className="text-sm">14,000 SAR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="font-medium text-lg mb-4">Add Note</h3>
            <Button className="w-full" variant="outline">
              <ClipboardList className="h-4 w-4 mr-2" />
              Add Internal Note
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => exportToPDF("dashboard-content", "frame_studio_performance.pdf")}>
          Export as PDF
        </Button>
        <Button variant="outline" onClick={() => exportToCSV(monthlyData, "frame_studio_performance.csv")}>
          Export as CSV
        </Button>
      </div>
    </div>
  )
}
