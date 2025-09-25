"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    gender: "",
    status: "",
    education: "",
    citizenship: "indian",
    isBPL: "no",
    bplCardNo: "",
    bplIssueYear: "",
    bplIssuingAuthority: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation mirroring backend constraints
    const errs: Record<string, string> = {}
    if (form.firstName.trim().length < 2) errs.firstName = "First name must be at least 2 characters"
    if (form.lastName.trim().length < 2) errs.lastName = "Last name must be at least 2 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please provide a valid email"
    if (!/^[+]?[\d\s-()]{10,15}$/.test(form.phone)) errs.phone = "Please provide a valid phone number"
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters"
    if (!form.gender) errs.gender = "Please select gender"
    if (!form.street || !form.city || !form.state || !form.pincode) errs.address = "Please complete your address"
    if (!form.status) errs.status = "Please select Rural or Urban"
    if (!form.education) errs.education = "Please select educational status"
    if (!form.citizenship) errs.citizenship = "Please select citizenship"
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match"
    if (!acceptedTerms) errs.terms = "You must accept the Terms of Service and Privacy Policy"
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          gender: form.gender || undefined,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country || 'India',
          },
          rtiProfile: {
            status: form.status || undefined,
            education: form.education || undefined,
            citizenship: form.citizenship || 'indian',
            isBPL: form.isBPL === 'yes',
            bplCardNo: form.bplCardNo || undefined,
            bplIssueYear: form.bplIssueYear || undefined,
            bplIssuingAuthority: form.bplIssuingAuthority || undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Map backend validation errors if present
        if (Array.isArray(data?.errors)) {
          const be: Record<string, string> = {}
          for (const item of data.errors) {
            if (item?.path && item?.msg && !be[item.path]) be[item.path] = item.msg
          }
          if (Object.keys(be).length > 0) setFieldErrors(be)
        }
        throw new Error(data?.message || "Failed to create account")
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>Join RTI Assistant to start filing applications</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    required
                    value={form.firstName}
                    onChange={onChange}
                    aria-invalid={!!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                  />
                  {fieldErrors.firstName && (
                    <p id="firstName-error" className="text-xs text-destructive">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    required
                    value={form.lastName}
                    onChange={onChange}
                    aria-invalid={!!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                  />
                  {fieldErrors.lastName && (
                    <p id="lastName-error" className="text-xs text-destructive">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={form.email}
                  onChange={onChange}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                  value={form.phone}
                  onChange={onChange}
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                />
                {fieldErrors.phone && (
                  <p id="phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={(value) => setForm((p) => ({ ...p, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="third">Third Gender</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.gender && (
                <p className="text-xs text-destructive">{fieldErrors.gender}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="citizenship">Citizenship</Label>
              <Select value={form.citizenship} onValueChange={(value) => setForm((p) => ({ ...p, citizenship: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select citizenship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.citizenship && (
                <p className="text-xs text-destructive">{fieldErrors.citizenship}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((p) => ({ ...p, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Rural or Urban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status && (
                <p className="text-xs text-destructive">{fieldErrors.status}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Educational Status</Label>
              <Select value={form.education} onValueChange={(value) => setForm((p) => ({ ...p, education: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="literate">Literate</SelectItem>
                  <SelectItem value="illiterate">Illiterate</SelectItem>
                  <SelectItem value="below12">Below 12th Standard</SelectItem>
                  <SelectItem value="12pass">12th Standard Pass</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="aboveGraduate">Above Graduate</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.education && (
                <p className="text-xs text-destructive">{fieldErrors.education}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Address</Label>
              <Input id="street" placeholder="Street / Address line" value={form.street} onChange={onChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="City" value={form.city} onChange={onChange} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={form.state} onValueChange={(value) => setForm((p) => ({ ...p, state: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                  <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                  <SelectItem value="Assam">Assam</SelectItem>
                  <SelectItem value="Bihar">Bihar</SelectItem>
                  <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                  <SelectItem value="Goa">Goa</SelectItem>
                  <SelectItem value="Gujarat">Gujarat</SelectItem>
                  <SelectItem value="Haryana">Haryana</SelectItem>
                  <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                  <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Kerala">Kerala</SelectItem>
                  <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Manipur">Manipur</SelectItem>
                  <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                  <SelectItem value="Mizoram">Mizoram</SelectItem>
                  <SelectItem value="Nagaland">Nagaland</SelectItem>
                  <SelectItem value="Odisha">Odisha</SelectItem>
                  <SelectItem value="Punjab">Punjab</SelectItem>
                  <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                  <SelectItem value="Sikkim">Sikkim</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Telangana">Telangana</SelectItem>
                  <SelectItem value="Tripura">Tripura</SelectItem>
                  <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pin code</Label>
              <Input id="pincode" placeholder="e.g., 110001" value={form.pincode} onChange={onChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="Country" value={form.country} onChange={onChange} />
            </div>
          </div>
          {fieldErrors.address && (
            <p className="text-xs text-destructive">{fieldErrors.address}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isBPL">Below Poverty Line (BPL)</Label>
              <Select value={form.isBPL} onValueChange={(value) => setForm((p) => ({ ...p, isBPL: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bplCardNo">BPL Card No. (if applicable)</Label>
              <Input id="bplCardNo" placeholder="Card Number" value={form.bplCardNo} onChange={onChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bplIssueYear">Year of Issue</Label>
              <Input id="bplIssueYear" placeholder="e.g., 2021" value={form.bplIssueYear} onChange={onChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bplIssuingAuthority">Issuing Authority</Label>
              <Input id="bplIssuingAuthority" placeholder="Authority" value={form.bplIssuingAuthority} onChange={onChange} />
            </div>
          </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={form.state} onValueChange={(value) => setForm((p) => ({ ...p, state: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                    <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                    <SelectItem value="Assam">Assam</SelectItem>
                    <SelectItem value="Bihar">Bihar</SelectItem>
                    <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                    <SelectItem value="Goa">Goa</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Haryana">Haryana</SelectItem>
                    <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                    <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Kerala">Kerala</SelectItem>
                    <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Manipur">Manipur</SelectItem>
                    <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                    <SelectItem value="Mizoram">Mizoram</SelectItem>
                    <SelectItem value="Nagaland">Nagaland</SelectItem>
                    <SelectItem value="Odisha">Odisha</SelectItem>
                    <SelectItem value="Punjab">Punjab</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Sikkim">Sikkim</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                    <SelectItem value="Tripura">Tripura</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    required
                    value={form.password}
                    onChange={onChange}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    value={form.confirmPassword}
                    onChange={onChange}
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    aria-pressed={showConfirm}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  aria-invalid={!!fieldErrors.terms}
                  aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {fieldErrors.terms && (
                <p id="terms-error" className="text-xs text-destructive">{fieldErrors.terms}</p>
              )}

              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
