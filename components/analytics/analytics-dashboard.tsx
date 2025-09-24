"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Users, Award, Clock, Target, Download, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

// Sample data for charts
const credentialsEarnedData = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 250 },
  { month: "Apr", value: 320 },
  { month: "May", value: 420 },
]

const successRatesData = [
  { month: "Jan", rate: 15 },
  { month: "Feb", rate: 25 },
  { month: "Mar", rate: 45 },
  { month: "Apr", rate: 60 },
  { month: "May", rate: 78 },
]

const credentialsOverviewData = [
  {
    name: "Data Science Professional",
    currentlyPursuing: 234,
    awarded: 156,
    avgCompletionTime: "42 days",
  },
  {
    name: "Cloud Architecture Specialist",
    currentlyPursuing: 189,
    awarded: 98,
    avgCompletionTime: "38 days",
  },
  {
    name: "Cybersecurity Fundamentals",
    currentlyPursuing: 156,
    awarded: 124,
    avgCompletionTime: "28 days",
  },
  {
    name: "Machine Learning Engineer",
    currentlyPursuing: 143,
    awarded: 87,
    avgCompletionTime: "52 days",
  },
]

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ReactNode
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card className="bg-white border border-[#efefef] hover:shadow-sm transition-shadow h-full">
      <CardContent className="p-4 h-full">
        <div className="flex flex-col h-full">
          {/* Top section with icon, title, value and trend badge */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-[#2b97cf]/10 rounded-lg flex-shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="h-8 flex items-start">
                  <p className="text-sm text-[#767676] font-medium leading-tight">{title}</p>
                </div>
                <p className="text-2xl font-bold text-[#000000] leading-none mt-1">{value}</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                trend === "up" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
              }`}
            >
              {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          </div>

          <div className="mt-auto">
            <p className="text-xs text-[#a8a4a1]">from last month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChartControlsProps {
  onDateRangeChange: (range: string) => void
  selectedRange: string
  customDateRange?: DateRange
  onCustomDateChange: (range: DateRange | undefined) => void
}

function ChartControls({ onDateRangeChange, selectedRange, customDateRange, onCustomDateChange }: ChartControlsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const dateRanges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
  ]

  const getCustomLabel = () => {
    if (customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
    }
    if (customDateRange?.from) {
      return format(customDateRange.from, "MMM d")
    }
    return "Custom"
  }

  return (
    <div className="flex justify-end mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {dateRanges.map((range) => (
          <Button
            key={range.value}
            variant={selectedRange === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => onDateRangeChange(range.value)}
            className={`text-xs px-3 py-1.5 h-auto ${
              selectedRange === range.value
                ? "bg-[#2b97cf] text-white hover:bg-[#2b97cf]/90"
                : "bg-white text-[#767676] border-[#e7e5e4] hover:bg-[#faf9f9]"
            }`}
          >
            {range.label}
          </Button>
        ))}

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedRange === "custom" ? "default" : "outline"}
              size="sm"
              className={`text-xs px-3 py-1.5 h-auto flex items-center gap-1.5 ${
                selectedRange === "custom"
                  ? "bg-[#2b97cf] text-white hover:bg-[#2b97cf]/90"
                  : "bg-white text-[#767676] border-[#e7e5e4] hover:bg-[#faf9f9]"
              }`}
            >
              <CalendarIcon className="w-3 h-3" />
              {getCustomLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={customDateRange}
              onSelect={(range) => {
                onCustomDateChange(range)
                if (range?.from && range?.to) {
                  onDateRangeChange("custom")
                  setIsCalendarOpen(false)
                }
              }}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const [credentialsDateRange, setCredentialsDateRange] = useState("today")
  const [successRatesDateRange, setSuccessRatesDateRange] = useState("today")
  const [credentialsCustomRange, setCredentialsCustomRange] = useState<DateRange | undefined>()
  const [successRatesCustomRange, setSuccessRatesCustomRange] = useState<DateRange | undefined>()

  const downloadCredentialsCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Month,Credentials Earned\n" +
      credentialsEarnedData.map((row) => `${row.month},${row.value}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "credentials_earned.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSuccessRatesCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Month,Success Rate (%)\n" +
      successRatesData.map((row) => `${row.month},${row.rate}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "success_rates.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-[#fefefe] p-4 lg:p-6 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Credentials"
          value="156"
          change="+12%"
          trend="up"
          icon={<Award className="w-5 h-5 text-[#2b97cf]" />}
        />
        <StatCard
          title="Active Pursuits"
          value="892"
          change="+15%"
          trend="up"
          icon={<Users className="w-5 h-5 text-[#2b97cf]" />}
        />
        <StatCard
          title="Avg. Completion Time"
          value="45 days"
          change="-8%"
          trend="down"
          icon={<Clock className="w-5 h-5 text-[#2b97cf]" />}
        />
        <StatCard
          title="Credentials Awarded"
          value="534"
          change="-20%"
          trend="down"
          icon={<Target className="w-5 h-5 text-[#2b97cf]" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Credentials Earned Chart */}
        <Card className="bg-white border border-[#efefef]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#000000]">Credentials earned</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCredentialsCSV}
                className="bg-[#f8f8f8] text-[#000000] border-[#e7e5e4] hover:bg-[#efefef] text-xs px-4 py-1.5 h-auto flex items-center gap-2 flex-shrink-0"
              >
                <Download className="w-3 h-3" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartControls
              onDateRangeChange={setCredentialsDateRange}
              selectedRange={credentialsDateRange}
              customDateRange={credentialsCustomRange}
              onCustomDateChange={setCredentialsCustomRange}
            />
            <ChartContainer
              config={{
                value: {
                  label: "Credentials",
                  color: "#2b97cf",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={credentialsEarnedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="credentialsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2b97cf" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#2b97cf" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#767676", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#767676", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2b97cf"
                    strokeWidth={2}
                    fill="url(#credentialsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Success Rates Chart */}
        <Card className="bg-white border border-[#efefef]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#000000]">Success Rates by Type</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSuccessRatesCSV}
                className="bg-[#f8f8f8] text-[#000000] border-[#e7e5e4] hover:bg-[#efefef] text-xs px-4 py-1.5 h-auto flex items-center gap-2 flex-shrink-0"
              >
                <Download className="w-3 h-3" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartControls
              onDateRangeChange={setSuccessRatesDateRange}
              selectedRange={successRatesDateRange}
              customDateRange={successRatesCustomRange}
              onCustomDateChange={setSuccessRatesCustomRange}
            />
            <ChartContainer
              config={{
                rate: {
                  label: "Success Rate %",
                  color: "#2b97cf",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={successRatesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efefef" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#767676", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#767676", fontSize: 12 }} domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2b97cf"
                    strokeWidth={3}
                    dot={{ fill: "#2b97cf", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#2b97cf" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-[#efefef]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-[#000000]">Credentials Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#efefef]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#767676]">Credential Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#767676]">Currently Pursuing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#767676]">Awarded</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#767676]">Avg. Completion Time</th>
                </tr>
              </thead>
              <tbody>
                {credentialsOverviewData.map((credential, index) => (
                  <tr key={index} className="border-b border-[#efefef] hover:bg-[#faf9f9]">
                    <td className="py-4 px-4 text-sm font-medium text-[#000000]">{credential.name}</td>
                    <td className="py-4 px-4 text-sm text-[#767676]">{credential.currentlyPursuing}</td>
                    <td className="py-4 px-4 text-sm text-[#767676]">{credential.awarded}</td>
                    <td className="py-4 px-4 text-sm text-[#767676]">{credential.avgCompletionTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
