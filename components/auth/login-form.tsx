"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { signIn } from "@/lib/auth-actions"
import { useSearchParams } from "next/navigation"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const message = searchParams.get("message")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    await signIn(formData)
    setIsLoading(false)
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 text-red-100">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="bg-green-500/10 border-green-500/50 text-green-100">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-blue-100">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-teal-300 hover:text-teal-200 underline">
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
