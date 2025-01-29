
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function GitHubPRAutomation() {
  const [formData, setFormData] = useState({
    repoOwner: "",
    repoName: "",
    baseBranch: "",
    systemMessage: "",
    userMessage: "",
    githubToken: "",
  })
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Here you would call your API to generate the AI response
    // For now, we'll simulate it with a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setAiResponse(
      "This is a simulated AI response. In a real implementation, this would contain the generated content and reasoning.",
    )
    setIsLoading(false)
  }

  const handleCreatePR = async () => {
    setIsLoading(true)
    // Here you would call your API to create the pull request
    // For now, we'll simulate it with a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert("Pull request created successfully!")
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">GitHub PR Automation</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Input Form</CardTitle>
            <CardDescription>Enter details for PR automation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repoOwner">Repository Owner</Label>
                  <Input
                    id="repoOwner"
                    name="repoOwner"
                    value={formData.repoOwner}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoName">Repository Name</Label>
                  <Input
                    id="repoName"
                    name="repoName"
                    value={formData.repoName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseBranch">Base Branch</Label>
                <Input
                  id="baseBranch"
                  name="baseBranch"
                  value={formData.baseBranch}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemMessage">System Message</Label>
                <Textarea
                  id="systemMessage"
                  name="systemMessage"
                  value={formData.systemMessage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userMessage">User Message</Label>
                <Textarea
                  id="userMessage"
                  name="userMessage"
                  value={formData.userMessage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                <Input
                  id="githubToken"
                  name="githubToken"
                  type="password"
                  value={formData.githubToken}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate AI Response"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>AI-Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            {aiResponse ? (
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded">{aiResponse}</pre>
            ) : (
              <p className="text-muted-foreground italic">AI response will appear here after generation.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreatePR} disabled={isLoading || !aiResponse}>
              {isLoading ? "Creating PR..." : "Create Pull Request"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
