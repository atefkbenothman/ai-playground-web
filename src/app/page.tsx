
"use client"

import { useActionState, useState } from "react"
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
import { SYSTEM_MSG } from "./prompts"
import { ActionResponse } from "@/types/pull-request"
import { submitPullRequest } from "@/actions/pull-request"

const initialState: ActionResponse = {
  success: false,
  message: ""
}

export default function GitHubPRAutomation() {
  const [state, action, isPending] = useActionState(submitPullRequest, initialState)

  const [aiResponse, setAiResponse] = useState<string>("")

  return (
    <div className="p-2 bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">GitHub PR Automation</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 text-xs">
          <CardHeader className="text-xs">
            <CardTitle>Input Form</CardTitle>
            <CardDescription>Enter details for PR automation</CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                <Input
                  id="githubToken"
                  name="githubToken"
                  required
                  minLength={1}
                  type="password"
                  className={state?.errors?.githubToken ? "border-red-500" : ""}
                  defaultValue={process.env.NEXT_PUBLIC_FORM_GITHUB_PAT || ""}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="repoOwner">Repository Owner</Label>
                  <Input
                    id="repoOwner"
                    name="repoOwner"
                    required
                    minLength={1}
                    defaultValue={process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_OWNER || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoName">Repository Name</Label>
                  <Input
                    id="repoName"
                    name="repoName"
                    required
                    minLength={1}
                    defaultValue={process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NAME || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="baseBranch">Base Branch</Label>
                  <Input
                    id="baseBranch"
                    name="baseBranch"
                    required
                    minLength={1}
                    defaultValue={process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBranch">New Branch</Label>
                  <Input
                    id="newBranch"
                    name="newBranch"
                    required
                    minLength={1}
                    defaultValue={process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NEW_BRANCH || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemMessage">System Message</Label>
                <Textarea
                  id="systemMessage"
                  name="systemMessage"
                  required
                  minLength={1}
                  defaultValue={SYSTEM_MSG}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userMessage">User Message</Label>
                <Textarea
                  id="userMessage"
                  name="userMessage"
                  required
                  minLength={1}
                  rows={4}
                />
              </div>
              <div className="py-2">
                <Button type="submit" disabled={isPending} className="">
                  Generate AI response
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
              <p className="text-muted-foreground italic text-xs">AI response will appear here after generation.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || !aiResponse}>
              {isPending ? "Creating PR..." : "Create Pull Request"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
