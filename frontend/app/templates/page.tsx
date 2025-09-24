"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  FileText,
  Bold as Road,
  Zap,
  GraduationCap,
  Heart,
  Building,
  Users,
  Banknote,
  Shield,
  Truck,
  Home,
  Eye,
  Edit,
  Download,
  Star,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const templates = [
  {
    id: 1,
    title: "Road Infrastructure",
    description: "Information about road construction, repairs, and maintenance",
    category: "Infrastructure",
    icon: Road,
    color: "bg-blue-500",
    popular: true,
    preview:
      "Request information about road construction projects, budget allocation, contractor details, and completion timelines in your area.",
    tags: ["Roads", "Construction", "PWD", "Municipal"],
  },
  {
    id: 2,
    title: "Electricity & Power",
    description: "Power supply, billing, and electrical infrastructure queries",
    category: "Utilities",
    icon: Zap,
    color: "bg-yellow-500",
    popular: true,
    preview:
      "Get details about power outages, electricity billing, transformer installations, and power supply projects.",
    tags: ["Electricity", "Power", "DISCOM", "Billing"],
  },
  {
    id: 3,
    title: "Education & Schools",
    description: "School admissions, infrastructure, and educational policies",
    category: "Education",
    icon: GraduationCap,
    color: "bg-green-500",
    popular: false,
    preview:
      "Information about school admissions, teacher appointments, infrastructure development, and educational schemes.",
    tags: ["Education", "Schools", "Admissions", "Teachers"],
  },
  {
    id: 4,
    title: "Healthcare Services",
    description: "Hospital facilities, medical schemes, and health programs",
    category: "Healthcare",
    icon: Heart,
    color: "bg-red-500",
    popular: false,
    preview: "Details about hospital services, medical equipment, health schemes, and healthcare infrastructure.",
    tags: ["Healthcare", "Hospitals", "Medical", "Health Schemes"],
  },
  {
    id: 5,
    title: "Ration & Food Security",
    description: "PDS, ration cards, and food distribution programs",
    category: "Food Security",
    icon: Home,
    color: "bg-orange-500",
    popular: true,
    preview: "Information about ration card applications, PDS shops, food grain distribution, and subsidy schemes.",
    tags: ["Ration", "PDS", "Food Security", "Subsidies"],
  },
  {
    id: 6,
    title: "Pension & Social Security",
    description: "Pension schemes, social security benefits, and welfare programs",
    category: "Social Welfare",
    icon: Users,
    color: "bg-purple-500",
    popular: true,
    preview: "Details about pension schemes, social security benefits, welfare programs, and benefit distribution.",
    tags: ["Pension", "Social Security", "Welfare", "Benefits"],
  },
  {
    id: 7,
    title: "Government Contracts",
    description: "Tender processes, contract awards, and procurement details",
    category: "Procurement",
    icon: Building,
    color: "bg-indigo-500",
    popular: false,
    preview: "Information about government tenders, contract awards, procurement processes, and vendor details.",
    tags: ["Contracts", "Tenders", "Procurement", "Vendors"],
  },
  {
    id: 8,
    title: "Financial Transactions",
    description: "Government expenditure, budget allocation, and financial records",
    category: "Finance",
    icon: Banknote,
    color: "bg-emerald-500",
    popular: false,
    preview: "Details about budget allocation, government expenditure, financial transactions, and audit reports.",
    tags: ["Finance", "Budget", "Expenditure", "Audit"],
  },
  {
    id: 9,
    title: "Police & Security",
    description: "Police records, security measures, and law enforcement",
    category: "Security",
    icon: Shield,
    color: "bg-slate-500",
    popular: false,
    preview:
      "Information about police records, security arrangements, crime statistics, and law enforcement activities.",
    tags: ["Police", "Security", "Crime", "Law Enforcement"],
  },
  {
    id: 10,
    title: "Transport & Vehicles",
    description: "Public transport, vehicle registration, and traffic management",
    category: "Transport",
    icon: Truck,
    color: "bg-cyan-500",
    popular: false,
    preview: "Details about public transport, vehicle registration, traffic management, and transport infrastructure.",
    tags: ["Transport", "Vehicles", "Traffic", "Public Transport"],
  },
]

const categories = [
  "All",
  "Infrastructure",
  "Utilities",
  "Education",
  "Healthcare",
  "Food Security",
  "Social Welfare",
  "Procurement",
  "Finance",
  "Security",
  "Transport",
]

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof templates)[0] | null>(null)

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularTemplates = templates.filter((t) => t.popular)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">RTI Templates</h1>
          <p className="text-muted-foreground">Choose from ready-made templates for common RTI requests</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Templates */}
        {selectedCategory === "All" && !searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Popular Templates
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{template.title}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Templates Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-4">
              {filteredTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card
                    key={template.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{template.title}</h3>
                            {template.popular && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              Use Template
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Template Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedTemplate ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${selectedTemplate.color} rounded-lg flex items-center justify-center`}
                      >
                        <selectedTemplate.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedTemplate.title}</CardTitle>
                        <CardDescription>{selectedTemplate.category}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.preview}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Link href={`/draft?template=${selectedTemplate.id}`}>
                        <Button className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Use This Template
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        Customize Template
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Download Sample
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">Select a Template</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any template to see more details and preview
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
