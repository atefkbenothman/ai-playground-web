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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { SYSTEM_MSG } from "@/lib/prompts"
import { ActionResponse } from "@/types/pull-request"
import { submitPullRequest } from "@/actions/pull-request"

const initialState: ActionResponse = {
  success: false,
  message: ""
}

export default function GitHubPRAutomation() {
  const [state, action, isPending] = useActionState(submitPullRequest, initialState)

  return (
    <div className="p-2 bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">GitHub PR Automation</h1>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-4">
        <Card className="flex-1 text-xs h-fit">
          <CardHeader className="text-xs">
            <CardTitle>Submission Form</CardTitle>
            <CardDescription>Enter details for pull request creation</CardDescription>
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
                  defaultValue={state?.inputs?.githubToken || process.env.NEXT_PUBLIC_FORM_GITHUB_PAT || ""}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2">
                  <Label htmlFor="repoOwner">Repository Owner</Label>
                  <Input
                    id="repoOwner"
                    name="repoOwner"
                    required
                    minLength={1}
                    defaultValue={state?.inputs?.repoOwner || process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_OWNER || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoName">Repository Name</Label>
                  <Input
                    id="repoName"
                    name="repoName"
                    required
                    minLength={1}
                    defaultValue={state?.inputs?.repoName || process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NAME || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2">
                  <Label htmlFor="baseBranch">Base Branch</Label>
                  <Input
                    id="baseBranch"
                    name="baseBranch"
                    required
                    minLength={1}
                    defaultValue={state?.inputs?.baseBranch || process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBranch">New Branch</Label>
                  <Input
                    id="newBranch"
                    name="newBranch"
                    required
                    minLength={1}
                    defaultValue={state?.inputs?.newBranch || process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NEW_BRANCH || ""}
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
                  defaultValue={state?.inputs?.systemMessage || SYSTEM_MSG}
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
                  defaultValue={state?.inputs?.userMessage || ""}
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
            <CardTitle>Pull Request</CardTitle>
          </CardHeader>
          <CardContent>
            {state?.success && state.aiResponse?.reasoning ? (
              <Tabs defaultValue="reasoning" className="">
                <TabsList className="w-full mb-1">
                  <TabsTrigger value="reasoning" className="w-full">Reasoning</TabsTrigger>
                  <TabsTrigger value="response" className="w-full">Response</TabsTrigger>
                </TabsList>
                <TabsContent value="reasoning">
                  <pre className="whitespace-pre-wrap bg-zinc-800 p-2 rounded">{state.aiResponse.reasoning.trim()}</pre>
                </TabsContent>
                <TabsContent value="response">
                  <pre className="whitespace-pre-wrap bg-zinc-800 p-2 rounded">{state.aiResponse.response.trim()}</pre>
                </TabsContent>
              </Tabs>
            ) : isPending ? (
              <p className="text-muted-foreground italic text-xs">Generating pull request...</p>
            ) : (
              <p className="text-muted-foreground italic text-xs">Pull request content will appear here after generation</p>
            )}
          </CardContent>
          {state?.success && state.aiResponse?.reasoning ? (
            <CardFooter>
              <Button type="submit" disabled={!state.success}>
                {isPending ? "Creating PR..." : "Create Pull Request"}
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </div>
  )
}