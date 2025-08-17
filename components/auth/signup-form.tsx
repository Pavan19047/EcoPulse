"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, Lock, User, Building, Microscope } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/auth-actions"
import { useSearchParams } from "next/navigation"

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("")
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  async function handleSubmit(formData: FormData) {
    formData.append("role", role)
    setIsLoading(true)
    await signUp(formData)
    setIsLoading(false)
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 text-red-100">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Dr. Jane Smith"
                required
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="researcher@university.edu"
                required
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="pl-10 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="public_health">Public Health Official</SelectItem>
                <SelectItem value="pharma">Pharmaceutical Professional</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization" className="text-white">
              Organization
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="organization"
                name="organization"
                type="text"
                placeholder="University of Research"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-white">
              Specialization
            </Label>
            <div className="relative">
              <Microscope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="specialization"
                name="specialization"
                type="text"
                placeholder="Infectious Diseases, Drug Discovery, etc."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isLoading || !role}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-blue-100">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-300 hover:text-teal-200 underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
