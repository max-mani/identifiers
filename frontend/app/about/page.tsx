import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Scale, Clock, Users, Shield, BookOpen, HelpCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">About RTI & Help</h1>
          <p className="text-muted-foreground">
            Understanding the Right to Information Act and how to use this platform
          </p>
        </div>

        <div className="space-y-8">
          {/* RTI Act Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2" />
                Right to Information Act, 2005
              </CardTitle>
              <CardDescription>Understanding your fundamental right to information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Right to Information Act, 2005 is a landmark legislation that empowers every citizen of India to
                access information from public authorities. This act promotes transparency and accountability in
                government functioning.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Who Can Apply?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Any citizen of India</li>
                    <li>• No age restriction</li>
                    <li>• No need to give reasons</li>
                    <li>• Can be filed by representative</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Response Timeline
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 30 days for normal requests</li>
                    <li>• 48 hours for life & liberty issues</li>
                    <li>• Additional 30 days if third party involved</li>
                    <li>• Penalty for delays</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use Platform */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                How to Use RTI Assistant
              </CardTitle>
              <CardDescription>Step-by-step guide to creating effective RTI applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Choose Your Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Use Quick Draft for simple requests or Guided Mode for step-by-step assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Describe Your Request</h4>
                    <p className="text-sm text-muted-foreground">
                      Be specific about what information you need. Include dates, locations, and document types
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Submit</h4>
                    <p className="text-sm text-muted-foreground">
                      Check the generated application and submit it to the relevant department
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Track Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      Use your dashboard to track application status and responses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips for Effective RTI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Tips for Effective RTI Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Do's</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Be specific and clear in your request</li>
                    <li>• Mention exact time periods</li>
                    <li>• Include relevant file numbers if known</li>
                    <li>• Keep copies of your application</li>
                    <li>• Follow up if no response in 30 days</li>
                    <li>• Use simple, direct language</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Don'ts</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Don't ask for opinions or interpretations</li>
                    <li>• Don't make multiple requests in one application</li>
                    <li>• Don't ask for information already in public domain</li>
                    <li>• Don't use abusive or threatening language</li>
                    <li>• Don't expect immediate responses</li>
                    <li>• Don't give up after first rejection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Is there a fee for RTI applications?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, there's usually a nominal fee (₹10 for central government, varies for states). BPL cardholders
                  are exempt from fees.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">What if my RTI is rejected?</h4>
                <p className="text-sm text-muted-foreground">
                  You can file an appeal with the First Appellate Authority within 30 days. If still unsatisfied,
                  approach the Information Commission.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Can I file RTI online?</h4>
                <p className="text-sm text-muted-foreground">
                  Many departments accept online RTI applications. Check the specific department's website or portal for
                  online submission options.
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">What information cannot be disclosed?</h4>
                <p className="text-sm text-muted-foreground">
                  Information affecting national security, personal privacy, commercial confidence, and certain other
                  exemptions under Section 8 of the RTI Act.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Need Help?
              </CardTitle>
              <CardDescription>Get support with your RTI applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Platform Support</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>support@rtiassistant.in</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>+91 1800-XXX-XXXX</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">RTI Legal Help</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>For legal advice on RTI matters, consult:</p>
                    <ul className="space-y-1">
                      <li>• State Information Commission</li>
                      <li>• RTI activists in your area</li>
                      <li>• Legal aid services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center">
                <Link href="/contact" className="text-primary hover:underline">
                  Contact us for more help →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
