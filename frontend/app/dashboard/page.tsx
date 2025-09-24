"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  FileText,
  MoreVertical,
  Edit,
  Download,
  Trash2,
  Copy,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  Building,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface RTIApplication {
  id: string
  title: string
  department: string
  status: "draft" | "submitted" | "under-review" | "responded" | "rejected"
  createdAt: string
  submittedAt?: string
  responseDate?: string
  category: string
  priority: "normal" | "urgent"
  description: string
}

const sampleApplications: RTIApplication[] = [
  {
    id: "1",
    title: "Road Repair Budget Information",
    department: "Municipal Corporation",
    status: "responded",
    createdAt: "2024-01-15",
    submittedAt: "2024-01-16",
    responseDate: "2024-02-10",
    category: "Infrastructure",
    priority: "normal",
    description: "Information about road repair budget allocation for Sector 15",
  },
  {
    id: "2",
    title: "School Infrastructure Development",
    department: "Education Department",
    status: "under-review",
    createdAt: "2024-01-20",
    submittedAt: "2024-01-21",
    category: "Education",
    priority: "normal",
    description: "Details about new school construction projects and budget",
  },
  {
    id: "3",
    title: "Electricity Bill Discrepancy",
    department: "Electricity Board",
    status: "submitted",
    createdAt: "2024-01-25",
    submittedAt: "2024-01-26",
    category: "Utilities",
    priority: "urgent",
    description: "Information about billing errors and correction process",
  },
  {
    id: "4",
    title: "Pension Scheme Details",
    department: "Social Welfare Department",
    status: "draft",
    createdAt: "2024-01-28",
    category: "Social Welfare",
    priority: "normal",
    description: "Information about senior citizen pension scheme eligibility",
  },
  {
    id: "5",
    title: "Water Supply Project Status",
    department: "Water Supply Department",
    status: "rejected",
    createdAt: "2024-01-10",
    submittedAt: "2024-01-11",
    responseDate: "2024-02-05",
    category: "Utilities",
    priority: "normal",
    description: "Status of water supply improvement project in residential area",
  },
]

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", icon: Send },
  "under-review": { label: "Under Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  responded: { label: "Responded", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: AlertCircle },
}

export default function DashboardPage() {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
        if (cancelled) return
        if (res.status === 401) {
          router.replace('/login')
        }
      } catch (_) {
        if (!cancelled) router.replace('/login')
      }
    })()
    return () => { cancelled = true }
  }, [router, API_BASE])
  const [applications, setApplications] = useState<RTIApplication[]>(sampleApplications)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  const getStatusStats = () => {
    const stats = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: applications.length,
      draft: stats.draft || 0,
      submitted: stats.submitted || 0,
      underReview: stats["under-review"] || 0,
      responded: stats.responded || 0,
      rejected: stats.rejected || 0,
    }
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My RTI Applications</h1>
              <p className="text-muted-foreground">Manage and track your RTI requests</p>
            </div>
            <Link href="/draft">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
                <div className="text-sm text-muted-foreground">Responded</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "You haven't created any RTI applications yet"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/draft">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Application
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => {
              const statusInfo = statusConfig[application.status]
              const StatusIcon = statusInfo.icon

              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">{application.title}</h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {application.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>

                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{application.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {application.department}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created: {new Date(application.createdAt).toLocaleDateString("en-IN")}
                          </div>
                          {application.submittedAt && (
                            <div className="flex items-center">
                              <Send className="w-4 h-4 mr-1" />
                              Submitted: {new Date(application.submittedAt).toLocaleDateString("en-IN")}
                            </div>
                          )}
                          {application.responseDate && (
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Response: {new Date(application.responseDate).toLocaleDateString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(application.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
