"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, FileText, CheckCircle, Wand2 } from "lucide-react"
import { useState } from "react"

interface FormData {
  informationType: string
  specificQuery: string
  department: string
  location: string
  timeframe: string
  urgency: string
  additionalDetails: string
  documentTypes: string[]
}

const steps = [
  { id: 1, title: "Information Type", description: "What kind of information do you need?" },
  { id: 2, title: "Specific Query", description: "Describe your specific request" },
  { id: 3, title: "Department & Location", description: "Which department and location?" },
  { id: 4, title: "Time & Urgency", description: "When do you need this information?" },
  { id: 5, title: "Additional Details", description: "Any additional context or requirements" },
  { id: 6, title: "Review & Generate", description: "Review your request and generate RTI" },
]

const informationTypes = [
  { value: "financial", label: "Financial Records", description: "Budget, expenditure, contracts, payments" },
  {
    value: "infrastructure",
    label: "Infrastructure Projects",
    description: "Roads, buildings, utilities, development",
  },
  { value: "policies", label: "Policies & Decisions", description: "Government policies, meeting minutes, decisions" },
  { value: "services", label: "Public Services", description: "Healthcare, education, welfare schemes" },
  { value: "personnel", label: "Personnel Information", description: "Staff details, appointments, transfers" },
  { value: "legal", label: "Legal Documents", description: "Rules, regulations, legal proceedings" },
  { value: "other", label: "Other", description: "Any other type of information" },
]

const departments = [
  "Municipal Corporation",
  "Public Works Department (PWD)",
  "Education Department",
  "Health Department",
  "Police Department",
  "Revenue Department",
  "Transport Department",
  "Electricity Board",
  "Water Supply Department",
  "Food & Civil Supplies",
  "Social Welfare Department",
  "Other",
]

const documentTypes = [
  { id: "files", label: "Files and Records" },
  { id: "correspondence", label: "Letters and Correspondence" },
  { id: "reports", label: "Reports and Studies" },
  { id: "contracts", label: "Contracts and Agreements" },
  { id: "bills", label: "Bills and Invoices" },
  { id: "photos", label: "Photographs" },
  { id: "maps", label: "Maps and Plans" },
  { id: "certificates", label: "Certificates and Licenses" },
]

export default function GuidedPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    informationType: "",
    specificQuery: "",
    department: "",
    location: "",
    timeframe: "",
    urgency: "normal",
    additionalDetails: "",
    documentTypes: [],
  })
  const [generatedRTI, setGeneratedRTI] = useState("")

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDocumentTypeChange = (docType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      documentTypes: checked ? [...prev.documentTypes, docType] : prev.documentTypes.filter((type) => type !== docType),
    }))
  }

  const generateRTI = () => {
    const selectedInfoType = informationTypes.find((type) => type.value === formData.informationType)
    const timeframeText = formData.timeframe ? `for the period ${formData.timeframe}` : ""
    const urgencyText = formData.urgency === "urgent" ? "This is an urgent request." : ""

    const rtiText = `To,
The Public Information Officer,
${formData.department},
${formData.location}

Subject: Application under Right to Information Act, 2005 - ${selectedInfoType?.label}

Sir/Madam,

I, [Your Name], a citizen of India, hereby request the following information under the Right to Information Act, 2005:

${formData.specificQuery}

Specifically, I would like to obtain:
${formData.documentTypes
  .map((type) => {
    const docType = documentTypes.find((d) => d.id === type)
    return `• ${docType?.label}`
  })
  .join("\n")}

${timeframeText ? `Time Period: ${timeframeText}` : ""}

${formData.additionalDetails ? `Additional Details: ${formData.additionalDetails}` : ""}

${urgencyText}

I am willing to pay the prescribed fee for obtaining the information. If any additional fee is required, please inform me in advance.

I request you to provide the information within 30 days as stipulated under Section 7(1) of the RTI Act, 2005.

If the information sought is not available with your office, please transfer this application to the concerned department under Section 6(3) of the RTI Act and inform me accordingly.

Thanking you,

Yours faithfully,
[Your Name]
[Your Address]
[Phone Number]
[Email Address]

Date: ${new Date().toLocaleDateString("en-IN")}
Place: ${formData.location}`

    setGeneratedRTI(rtiText)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.informationType !== ""
      case 2:
        return formData.specificQuery.trim() !== ""
      case 3:
        return formData.department !== "" && formData.location.trim() !== ""
      case 4:
        return true // Optional fields
      case 5:
        return true // Optional fields
      case 6:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What type of information do you need?</h2>
              <p className="text-muted-foreground">Select the category that best describes your request</p>
            </div>

            <RadioGroup
              value={formData.informationType}
              onValueChange={(value) => handleInputChange("informationType", value)}
              className="space-y-4"
            >
              {informationTypes.map((type) => (
                <div
                  key={type.value}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer"
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Describe your specific request</h2>
              <p className="text-muted-foreground">Be as specific as possible about what information you need</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="specificQuery">What exactly do you want to know?</Label>
                <Textarea
                  id="specificQuery"
                  placeholder="Example: I want to know the total amount spent on road repairs in Sector 15 during 2023, including contractor names, bill amounts, and work completion dates."
                  value={formData.specificQuery}
                  onChange={(e) => handleInputChange("specificQuery", e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>What types of documents do you need? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {documentTypes.map((docType) => (
                    <div key={docType.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={docType.id}
                        checked={formData.documentTypes.includes(docType.id)}
                        onCheckedChange={(checked) => handleDocumentTypeChange(docType.id, checked as boolean)}
                      />
                      <Label htmlFor={docType.id} className="text-sm">
                        {docType.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Department and Location</h2>
              <p className="text-muted-foreground">Which department should handle your request?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="department">Target Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select the relevant department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location/Area</Label>
                <Input
                  id="location"
                  placeholder="e.g., New Delhi, Mumbai, Sector 15 Gurgaon"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Time Period and Urgency</h2>
              <p className="text-muted-foreground">Specify the time period for your request</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="timeframe">Time Period (Optional)</Label>
                <Input
                  id="timeframe"
                  placeholder="e.g., January 2023 to December 2023, Last 6 months, 2022-2024"
                  value={formData.timeframe}
                  onChange={(e) => handleInputChange("timeframe", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>How urgent is this request?</Label>
                <RadioGroup
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange("urgency", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal (30 days response time)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Urgent (Please expedite)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Additional Details</h2>
              <p className="text-muted-foreground">Any additional context or specific requirements</p>
            </div>

            <div>
              <Label htmlFor="additionalDetails">Additional Information (Optional)</Label>
              <Textarea
                id="additionalDetails"
                placeholder="Any additional context, background information, or specific requirements that might help in processing your request..."
                value={formData.additionalDetails}
                onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Your Request</h2>
              <p className="text-muted-foreground">
                Please review your information before generating the RTI application
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Information Type:</Label>
                  <p className="text-sm text-muted-foreground">
                    {informationTypes.find((type) => type.value === formData.informationType)?.label}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="font-medium">Specific Query:</Label>
                  <p className="text-sm text-muted-foreground">{formData.specificQuery}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Department:</Label>
                    <p className="text-sm text-muted-foreground">{formData.department}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Location:</Label>
                    <p className="text-sm text-muted-foreground">{formData.location}</p>
                  </div>
                </div>

                {formData.timeframe && (
                  <>
                    <Separator />
                    <div>
                      <Label className="font-medium">Time Period:</Label>
                      <p className="text-sm text-muted-foreground">{formData.timeframe}</p>
                    </div>
                  </>
                )}

                {formData.documentTypes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="font-medium">Document Types:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.documentTypes.map((type) => {
                          const docType = documentTypes.find((d) => d.id === type)
                          return (
                            <Badge key={type} variant="outline" className="text-xs">
                              {docType?.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {!generatedRTI ? (
              <Button onClick={generateRTI} className="w-full h-12">
                <Wand2 className="w-5 h-5 mr-2" />
                Generate RTI Application
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    RTI Application Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4 border mb-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{generatedRTI}</pre>
                  </div>
                  <div className="flex space-x-2">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Download RTI
                    </Button>
                    <Button variant="outline">Copy Text</Button>
                    <Button variant="outline">Save Draft</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Guided RTI Assistant</h1>
            <Badge variant="outline">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{steps[currentStep - 1].title}</span>
            <span>•</span>
            <span>{steps[currentStep - 1].description}</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
