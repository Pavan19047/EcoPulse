import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Microscope } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Research Projects</h1>
        <p className="text-gray-600">Manage and track ongoing research initiatives</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Microscope className="mr-2 h-5 w-5" />
            Project Management
          </CardTitle>
          <CardDescription>Coming soon - Collaborative research project management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            This section will contain project tracking, collaboration tools, and research workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
