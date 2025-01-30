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
  const [isCreatingPR, setIsCreatingPR] = useState(false)

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
    try {
      setIsCreatingPR(true)
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
    } finally {
      setIsCreatingPR(false)
    }
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
              {/* Form fields remain unchanged */}
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
                  {/* Tabs content remains unchanged */}
                </Tabs>
              </div>
            ) : null}
          </CardContent>
          {formState?.success && formState?.data ? (
            <CardFooter>
              <Button 
                type="submit" 
                onClick={() => handleSubmitPullRequest(formState)}
                disabled={isCreatingPR || prData?.success}
              >
                {isCreatingPR ? "Creating..." : "Create Pull Request"}
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