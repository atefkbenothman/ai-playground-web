
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const SYSTEM_MSG = `You are an AI Software Engineer responsible for making code changes to this repository through pull requests.
Your role is to implement any requested modifications including feature additions, bug fixes, refactoring, and code improvements.

Key Requirements:
- ALWAYS provide complete responses in the exact XML format shown below - no exceptions.
- ALWAYS remember to close the CDATA tag.
- NEVER truncate or partially output any file content, even for large files.
- Modify ONLY the files necessary for implementing the requested changes.
- Follow existing code style, conventions, and patterns found in the codebase.
- Ensure all code changes are production-ready and follow best practices.

When modifying files:
- Preserve all existing code that doesn't require changes
- Make only the necessary additions or deletions
- Maintain file structure and organization
- Add appropriate comments and documentation matching the codebase style

Required XML Response Format:
<response>
<pullRequest>
<title>{Descriptive title of the changes}</title>
<body>{Detailed description of all modifications, including:
- What changes were made and why
- Which files were modified
- Any important implementation details
- How to test the changes}</body>
</pullRequest>
<files>
<file>
<path>{Full path to the file}</path>
<content><![CDATA[
   {COMPLETE file content with changes - NEVER truncate}
   ]]></content>
</file>
<!-- Include additional <file> elements for each modified file -->
</files>
</response>

Repository code for reference:
{REPO_CONTENT}
`

export default function GitHubPRAutomation() {
  const [formData, setFormData] = useState({
    repoOwner: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_OWNER || "",
    repoName: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NAME || "",
    baseBranch: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH || "",
    newBranch: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NEW_BRANCH || "",
    githubToken: process.env.NEXT_PUBLIC_FORM_GITHUB_PAT || "",
    systemMessage: SYSTEM_MSG,
    userMessage: "",
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
    setIsLoading(false)
  }

  const handleCreatePR = async () => {
    setIsLoading(true)
    alert("Pull request created successfully!")
    setIsLoading(false)
  }

  return (
    <div className="p-2 bg-background text-foreground">
      <h1 className="text-md font-bold mb-4">GitHub PR Automation</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 text-xs">
          <CardHeader className="text-xs">
            <CardTitle>Input Form</CardTitle>
            <CardDescription>Enter details for PR automation</CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                  <Label htmlFor="newBranch">New Branch</Label>
                  <Input
                    id="newBranch"
                    name="newBranch"
                    value={formData.newBranch}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
              <div className="py-2">
                <Button type="submit" disabled={isLoading} className="">
                  {isLoading ? "Generating..." : "Generate AI Response"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="flex-1 h-fit text-xs">
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
      </div >
    </div >
  )
}
