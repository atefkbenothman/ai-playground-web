"use server"

import { z } from "zod"
import { ActionResponse, PRFormData } from "@/types/pull-request"


const pullRequestSchema = z.object({
  repoOwner: z.string().min(1, "Repo owner is required"),
  repoName: z.string().min(1, "Repo name is required"),
  baseBranch: z.string().min(1, "Base branch is required"),
  newBranch: z.string().min(1, "New branch is required"),
  githubToken: z.string().min(1, "Github token is required"),
  systemMessage: z.string().min(1, "System message is required"),
  userMessage: z.string().min(1, "User message is required"),
})

export async function submitPullRequest(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
  try {
    const rawData: PRFormData = {
      repoOwner: formData.get("repoOwner") as string,
      repoName: formData.get("repoName") as string,
      baseBranch: formData.get("baseBranch") as string,
      newBranch: formData.get("newBranch") as string,
      githubToken: formData.get("githubToken") as string,
      systemMessage: formData.get("systemMessage") as string,
      userMessage: formData.get("userMessage") as string,
    }
    // validate form data
    const validatedData = pullRequestSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors
      }
    }

    // save form data somewhere
    console.log("form data: ", validatedData.data)

    return {
      success: true,
      message: "PR form saved successfully"
    }
  } catch (err) {
    return {
      success: false,
      message: "An unexpected error occurred"
    }
  }
}