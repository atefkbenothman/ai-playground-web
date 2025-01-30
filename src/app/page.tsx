"use client"

import { useActionState, useState, useEffect } from "react"
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
import { FILE_EXCLUDE_LIST } from "@/lib/config"
import { CreatePRResponse, PRFormActionResponse } from "@/types/pull-request"
import { submitForm, submitPullRequest } from "@/actions/pull-request"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"


const initialFormState: PRFormActionResponse = {
  success: false,
  message: "",
  inputs: {
    githubToken: process.env.NEXT_PUBLIC_FORM_GITHUB_PAT || "",
    repoOwner: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_OWNER || "",
    repoName: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_NAME || "",
    baseBranch: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH || "",
    newBranch: process.env.NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH || "",
    systemMessage: SYSTEM_MSG || "",
    userMessage: "",
    excludeList: FILE_EXCLUDE_LIST.join("\n")
  }
}

export default function GitHubPRAutomation() {
  const { toast } = useToast()

  const [formState, formAction, formIsPending] = useActionState(submitForm, initialFormState)

  const [prData, setPrData] = useState<CreatePRResponse>()

  useEffect(() => {
    if (!formState.success) {
      toast({
        title: "Error!",
        description: formState.message,
        variant: "destructive",
        duration: 10000
      })
    }
  }, [formState])

  const handleSubmitPullRequest = async (formState: PRFormActionResponse) => {
    const data: CreatePRResponse = await submitPullRequest(formState)
    if (!data.success) {
      toast({
        title: "Error!",
        description: data.message,
        variant: "destructive",
        duration: 10000
      })
    } else {
      toast({
        title: "Successfully created Pull Request!",
        description: data?.pr?.html_url,
        duration: 10000
      })
    }
    setPrData(data)
  }

  return (
    <div className="p-2 bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">GitHub PR Automation</h1>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-4">
        <Card className="flex-1 text-xs h-fit">
          <CardHeader className="text-xs">
            <CardTitle>Submission Form</CardTitle>
            <CardDescription>Enter details for pull request generation</CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                <Input
                  id="githubToken"
                  name="githubToken"
                  required
                  minLength={1}
                  type="password"
                  className={formState?.errors?.githubToken ? "border-red-500" : ""}
                  defaultValue={formState?.inputs?.githubToken || initialFormState.inputs?.githubToken || ""}
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
                    className={formState?.errors?.repoOwner ? "border-red-500" : ""}
                    defaultValue={formState?.inputs?.repoOwner || initialFormState.inputs?.repoOwner || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoName">Repository Name</Label>
                  <Input
                    id="repoName"
                    name="repoName"
                    required
                    minLength={1}
                    className={formState?.errors?.repoName ? "border-red-500" : ""}
                    defaultValue={formState?.inputs?.repoName || initialFormState.inputs?.repoName || ""}
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
                    className={formState?.errors?.baseBranch ? "border-red-500" : ""}
                    defaultValue={formState?.inputs?.baseBranch || initialFormState.inputs?.baseBranch || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newBranch">New Branch</Label>
                  <Input
                    id="newBranch"
                    name="newBranch"
                    required
                    minLength={1}
                    className={formState?.errors?.newBranch ? "border-red-500" : ""}
                    defaultValue={formState?.inputs?.newBranch || initialFormState.inputs?.newBranch || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excludeList">Ignore Files</Label>
                <Textarea
                  id="excludeList"
                  name="excludeList"
                  minLength={1}
                  rows={4}
                  defaultValue={formState?.inputs?.excludeList === undefined ? initialFormState.inputs?.excludeList : formState?.inputs.excludeList}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemMessage">System Message</Label>
                <Textarea
                  id="systemMessage"
                  name="systemMessage"
                  required
                  minLength={1}
                  className={formState?.errors?.systemMessage ? "border-red-500" : ""}
                  defaultValue={formState?.inputs?.systemMessage || initialFormState.inputs?.systemMessage || ""}
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
                  className={formState?.errors?.userMessage ? "border-red-500" : ""}
                  defaultValue={formState?.inputs?.userMessage || initialFormState.inputs?.userMessage || ""}
                />
              </div>
              <div className="py-2">
                <Button type="submit" disabled={formIsPending}>
                  Generate Pull Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className={cn(`flex-1 h-fit text-xs`, !formState.success ? "invisible" : "visible")}>
          <CardHeader>
            <CardTitle>Pull Request</CardTitle>
          </CardHeader>
          <CardContent>
            {formIsPending ? (
              <p className="text-muted-foreground italic text-xs">Generating pull request...</p>
            ) : null}
            {formState?.success && formState?.data ? (
              <div>
                <Tabs defaultValue="reasoning" className="">
                  <TabsList className="w-full mb-1">
                    <TabsTrigger value="reasoning" className="w-full">Reasoning</TabsTrigger>
                    <TabsTrigger value="response" className="w-full">Response</TabsTrigger>
                    <TabsTrigger value="files" className="w-full">Files</TabsTrigger>
                  </TabsList>
                  <TabsContent value="reasoning">
                    <pre className="whitespace-pre-wrap bg-zinc-800 p-2 rounded">{formState.data?.reasoning?.trim()}</pre>
                  </TabsContent>
                  <TabsContent value="response">
                    <pre className="whitespace-pre-wrap bg-zinc-800 p-2 rounded">{formState.data?.response?.trim()}</pre>
                  </TabsContent>
                  <TabsContent value="files">
                    <div className="space-y-4">
                      {formState.data?.files?.length > 0 ? (
                        formState.data.files.map((file, index) => (
                          <div key={index} className="p-2 bg-zinc-800 rounded">
                            <div className="font-medium mb-2">{file.path}</div>
                            <div className="text-xs text-zinc-400 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-xs">{file.content}</pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">No files included in this pull request</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </CardContent>
          {formState?.success && formState?.data ? (
            <CardFooter>
              <Button type="submit" onClick={() => handleSubmitPullRequest(formState)}>
                Create Pull Request
              </Button>
            </CardFooter>
          ) : null}
          {prData?.success && prData?.pr ? (
            <CardFooter className="flex flex-col items-start">
              <p>Number: {prData?.pr.number}</p>
              <p>Link: {prData?.pr.html_url}</p>
            </CardFooter>
          ) : null}
        </Card>

      </div>
    </div>
  )
}