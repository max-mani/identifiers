"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Mic, MicOff, Upload, Download, Copy, Save, Wand2, Languages, Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DraftPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [generatedRTI, setGeneratedRTI] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'pdf' | 'word'>('txt')
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("other")
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  const [clarifyLoading, setClarifyLoading] = useState(false)
  const [questions, setQuestions] = useState<Array<{id: string; label: string; placeholder?: string; type?: string; options?: string[]}> | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showAutofillHelp, setShowAutofillHelp] = useState(false)

  const handleGenerate = async () => {
    setError(null)
    setApplicationId(null)
    if (!inputText.trim()) {
      setError("Please enter your query")
      return
    }
    if (department.trim().length < 2) {
      setError("Please enter a valid department (min 2 characters)")
      return
    }
    if (location.trim().length < 2) {
      setError("Please enter a valid location (min 2 characters)")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch(`${API_BASE}/api/rti/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: inputText,
          department,
          location,
          category,
          language: selectedLanguage,
        }),
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to generate RTI application")
      }
      setGeneratedRTI(data?.data?.generatedText || "")
      setApplicationId(data?.data?._id || null)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedRTI)
  }

  const syncDraft = async (): Promise<string | null> => {
    // Ensure we have an application on the backend and its text matches local edits
    try {
      if (!applicationId) {
        // Create via generate if not created yet
        if (!inputText.trim()) throw new Error('Please enter your query before saving')
        if (department.trim().length < 2) throw new Error('Please enter a valid department (min 2 characters)')
        if (location.trim().length < 2) throw new Error('Please enter a valid location (min 2 characters)')
        const res = await fetch(`${API_BASE}/api/rti/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            query: inputText,
            department,
            location,
            category,
            language: selectedLanguage,
          }),
        })
        if (res.status === 401) { router.replace('/login'); return null }
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Failed to create draft')
        const id = data?.data?._id as string
        setApplicationId(id || null)
        // If local edited text differs, update
        if (generatedRTI && data?.data?.generatedText !== generatedRTI) {
          const upd = await fetch(`${API_BASE}/api/rti/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ generatedText: generatedRTI })
          })
          if (upd.status === 401) { router.replace('/login'); return null }
        }
        return id || null
      } else {
        // Update existing with latest edits
        const upd = await fetch(`${API_BASE}/api/rti/${applicationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ generatedText: generatedRTI })
        })
        if (upd.status === 401) { router.replace('/login'); return null }
        return applicationId
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save draft')
      return null
    }
  }

  const handleDownloadNow = async () => {
    if (downloadFormat === 'txt') {
      const element = document.createElement("a")
      const file = new Blob([generatedRTI], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "RTI_Application.txt"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      setDownloadOpen(false)
      return
    }
    // For pdf/word, call backend export endpoints if we have application id
    const id = await syncDraft()
    if (id) {
      const endpoint = downloadFormat === 'pdf' ? 'pdf' : 'word'
      try {
        const res = await fetch(`${API_BASE}/api/export/${endpoint}/${id}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: 'RTI_Application' }),
        })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        if (!res.ok) {
          throw new Error('Failed to export file')
        }
        // The server responds with a file download; opening a new window/tab preserves the download
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = downloadFormat === 'pdf' ? 'RTI_Application.pdf' : 'RTI_Application.docx'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.error(e)
      }
    }
    setDownloadOpen(false)
  }

  const rtiPortalUrl = "https://rtionline.gov.in/request/request.php"

  const handleApplyNow = async () => {
    if (!generatedRTI.trim()) return
    try {
      window.name = generatedRTI
      localStorage.setItem("rti_autofill_text", generatedRTI)
      // Also store user profile if available via /api/auth/me
      try {
        const me = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
        if (me.ok) {
          const j = await me.json()
          if (j?.user) {
            localStorage.setItem('rti_profile', JSON.stringify(j.user))
          }
        }
      } catch {}
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedRTI)
      }
    } catch (e) {
      // ignore
    }
    window.open(rtiPortalUrl, "_blank", "noopener,noreferrer")
    setShowAutofillHelp(true)
  }

  const bookmarklet = `javascript:(async function(){try{function ev(el,type){try{el&&el.dispatchEvent(new Event(type,{bubbles:true}))}catch(e){}}function byId(id){return document.getElementById(id)}function setVal(el,val){if(!el||val==null)return;el.value=val;ev(el,'input');ev(el,'change')}function setRadioByName(name,val){var els=document.getElementsByName(name);for(var i=0;i<els.length;i++){if(els[i].value===(val||'')){els[i].checked=true;ev(els[i],'change')}}}var t=window.name||localStorage.getItem('rti_autofill_text')||'';if(!t&&navigator.clipboard&&navigator.clipboard.readText){try{t=await navigator.clipboard.readText()}catch(e){}}var profileRaw=localStorage.getItem('rti_profile');var profile=null;try{profile=profileRaw?JSON.parse(profileRaw):null}catch(e){}if(!t){alert('No RTI text found. Go back and click Apply Now again.');return}var ta=byId('Description');if(ta){setVal(ta,t)}else{var areas=[...document.querySelectorAll('textarea')];areas.sort(function(a,b){function s(el){var w=el.cols||el.offsetWidth||0;var h=el.rows||el.offsetHeight||0;return w*h}return s(b)-s(a)});if(areas[0]){setVal(areas[0],t)}}if(profile){try{setVal(byId('Email'),profile.email);setVal(byId('ConfirmEmail'),profile.email);var phone=(profile.phone||'').replace(/\D/g,'');if(phone.length>10)phone=phone.slice(-10);setVal(byId('cell'),phone);setVal(byId('phone'),phone);setVal(byId('Name'),profile.fullName||'');var g=(profile.gender||'').toLowerCase();if(g==='male')setRadioByName('gender','M');if(g==='female')setRadioByName('gender','F');if(g==='third')setRadioByName('gender','T');var addr1='';var addr2='';var addr3='';if(profile.address){if(profile.address.street)addr1=profile.address.street;if(profile.address.city)addr2=profile.address.city;if(profile.address.pincode)addr3=profile.address.pincode;setVal(byId('address1'),addr1);setVal(byId('address2'),addr2);setVal(byId('address3'),addr3);setVal(byId('pincode'),profile.address.pincode||'');var country=(profile.address.country||'India');if(country&&country.toLowerCase()==='india'){setRadioByName('chkCountry','001')}else{setRadioByName('chkCountry','999');setVal(byId('txtCountry'),country)}var stateMap={"Andhra Pradesh":"AP","Arunachal Pradesh":"AR","Assam":"AS","Bihar":"BH","Chandigarh":"CH","Chhattisgarh":"CG","Delhi":"DH","Goa":"GD","Gujarat":"GJ","Haryana":"HY","Himachal Pradesh":"HP","Jammu And Kashmir":"JK","Jharkhand":"JH","Karnataka":"KN","Kerala":"KL","Lakshadweep":"LD","Madhya Pradesh":"MP","Maharashtra":"MH","Manipur":"MN","Meghalaya":"MG","Mizoram":"MZ","Nagaland":"NL","No State":"XX","Odisha":"OR","Puducherry":"PC","Punjab":"PB","Rajasthan":"RJ","Sikkim":"SK","Tamil Nadu":"TN","Tamilnadu":"TN","Telangana":"TG","Tripura":"TR","Union Territory":"UT","Uttarakhand":"UC","Uttar Pradesh":"UP","West Bengal":"WB"};var st=(profile.address.state||'').trim();var code=stateMap[st]||'';if(code){setVal(byId('stateId'),code)}}if(profile.rtiProfile){var status=profile.rtiProfile.status;if(status==='rural')setRadioByName('status','R');if(status==='urban')setRadioByName('status','U');var edu=profile.rtiProfile.education;if(edu==='illiterate'){setRadioByName('educational_Status','I')}else{setRadioByName('educational_Status','L');var degMap={below12:'BT','12pass':'TP','graduate':'GD','aboveGraduate':'PG'};var d=degMap[edu];if(d){setRadioByName('graduate_degree',d)}}setVal(byId('Citizenship'),(profile.rtiProfile.citizenship==='other')?'N':'I');setVal(byId('BPL'),profile.rtiProfile.isBPL?'Y':'N');setVal(byId('bplCardNo'),profile.rtiProfile.bplCardNo||'');setVal(byId('YearOfUssue'),profile.rtiProfile.bplIssueYear||'');setVal(byId('IssuAuthority'),profile.rtiProfile.bplIssuingAuthority||'')}}catch(e){}}alert('Filled RTI text and personal details. Please verify and complete captcha.')}catch(err){alert('Autofill failed: '+err)}})()`

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Draft RTI Application</h1>
          <p className="text-muted-foreground">Convert your query into a proper RTI application format</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Your Query
                </CardTitle>
                <CardDescription>Describe what information you need in simple language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="query">What do you want to know?</Label>
                  <Textarea
                    id="query"
                    placeholder="Example: How much money was spent on road repairs in Sector 15 last year? I want to see all the bills and contractor details."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className="text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={toggleRecording}
                    className={`flex-1 ${isRecording ? "bg-red-50 border-red-200 text-red-700" : ""}`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Input
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </Button>
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2 text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Recording...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="w-5 h-5 mr-2" />
                  Language & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Output Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                      <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Target Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Municipal Corporation, PWD, Education Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New Delhi, Chennai, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="policies">Policies</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="personnel">Personnel</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {questions && (
                  <div className="space-y-3">
                    <Label>Additional Details</Label>
                    {questions.map((q) => (
                      <div key={q.id} className="space-y-1">
                        <Label htmlFor={`q-${q.id}`}>{q.label}</Label>
                        {q.type === 'select' && q.options ? (
                          <Select value={answers[q.id] || ''} onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}>
                            <SelectTrigger id={`q-${q.id}`}>
                              <SelectValue placeholder={q.placeholder || 'Select'} />
                            </SelectTrigger>
                            <SelectContent>
                              {q.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`q-${q.id}`}
                            placeholder={q.placeholder || ''}
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive" role="alert">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setError(null)
                      if (!inputText.trim()) {
                        setError('Please enter your query')
                        return
                      }
                      setClarifyLoading(true)
                      try {
                        const res = await fetch(`${API_BASE}/api/rti/clarify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ query: inputText, language: selectedLanguage })
                        })
                        if (res.status === 401) { router.replace('/login'); return }
                        const data = await res.json()
                        if (!res.ok) throw new Error(data?.message || 'Failed to get questions')
                        setQuestions(data.data || [])
                      } catch (e: any) {
                        setError(e.message || 'Something went wrong')
                      } finally {
                        setClarifyLoading(false)
                      }
                    }}
                    disabled={clarifyLoading || isGenerating}
                  >
                    {clarifyLoading ? 'Finding missing info…' : 'Ask missing info'}
                  </Button>

                  <Button
                    onClick={handleGenerate}
                    disabled={!inputText.trim() || isGenerating}
                    className="flex-1 h-12 text-base"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Generating RTI...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate RTI Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Generated RTI Application
                    </CardTitle>
                    <CardDescription>Your query converted to legal RTI format</CardDescription>
                  </div>
                  {generatedRTI && (
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                      Ready to Submit
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedRTI ? (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <Textarea
                        value={generatedRTI}
                        onChange={(e) => setGeneratedRTI(e.target.value)}
                        rows={18}
                        className="whitespace-pre-wrap text-sm font-mono leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleCopy} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button onClick={handleApplyNow} size="sm" className="bg-primary text-primary-foreground">
                        Apply Now (RTI Online)
                      </Button>
                      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Select file format</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as any)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                                <SelectItem value="word">Word (.docx)</SelectItem>
                                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" onClick={() => setDownloadOpen(false)}>Cancel</Button>
                              <Button onClick={handleDownloadNow}>Download</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                    </div>
                    {showAutofillHelp && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                        <p className="text-sm mb-2">After the RTI Online page opens, click this to autofill:</p>
                        <a href={bookmarklet} className="text-sm underline text-primary break-all" title="Drag to bookmarks bar and click on RTI Online page">RTI Autofill</a>
                        <p className="text-xs mt-2 text-muted-foreground">You can drag this link to your bookmarks bar and click it on the RTI Online page.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No RTI Generated Yet</p>
                    <p className="text-sm">
                      Enter your query and click "Generate RTI Application" to see the formatted application
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedRTI && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Review the Application</p>
                      <p className="text-sm text-muted-foreground">Check all details and make any necessary edits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Submit to Department</p>
                      <p className="text-sm text-muted-foreground">Send via post, email, or online portal</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Track Response</p>
                      <p className="text-sm text-muted-foreground">You should receive a response within 30 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
