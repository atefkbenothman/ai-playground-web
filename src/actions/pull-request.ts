"use server"

import { z } from "zod"
import { GithubService } from "@/services/github"
import {
  FileContent,
  GHRepoCodebaseActionResponse,
  PRFormData,
  PRActionResponse,
  PRFormActionResponse,
  CreatePRResponse
} from "@/types/pull-request"
import { generateAIResponse } from "@/services/ai"
import { extractModelResponse, formatRepoContents, parseXMLFromResponse } from "@/lib/parser"


export async function getRepoCodebase(repoOwner: string, repoName: string, githubToken: string): Promise<GHRepoCodebaseActionResponse> {
  try {
    const github = new GithubService(repoOwner, repoName, githubToken)
    const repoContent: FileContent[] = await github.getRepositoryContents("", [])
    return {
      success: true,
      message: "Successfully retrieved repo codebase",
      codebase: repoContent
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: `Error retrieving repo codebase: ${err}`,
      codebase: [],
    }
  }
}

export async function generatePullRequest(systemPrompt: string, userPrompt: string): Promise<PRActionResponse> {
  try {
    // generate response from AI
    const { response, reasoning } = await generateAIResponse(systemPrompt, userPrompt)
    // parse xml portion from response
    const content = parseXMLFromResponse(response)
    // extract pull request metadata and updated file contents from xml
    const { prMetadata, files } = await extractModelResponse(content)
    return {
      success: true,
      message: "Succesfully generated ai pull request",
      data: {
        response,
        reasoning,
        prMetadata,
        files,
      }
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: `Error generating ai pull request: ${err}`,
    }
  }
}

const pullRequestSchema = z.object({
  repoOwner: z.string().min(1, "Repo owner is required"),
  repoName: z.string().min(1, "Repo name is required"),
  baseBranch: z.string().min(1, "Base branch is required"),
  newBranch: z.string().min(1, "New branch is required"),
  githubToken: z.string().min(1, "Github token is required"),
  systemMessage: z.string().min(1, "System message is required"),
  userMessage: z.string().min(1, "User message is required"),
  excludeList: z.string().optional()
})

export async function submitForm(prevState: PRFormActionResponse | null, formData: FormData): Promise<PRFormActionResponse> {
  const rawData: PRFormData = {
    repoOwner: formData.get("repoOwner") as string,
    repoName: formData.get("repoName") as string,
    baseBranch: formData.get("baseBranch") as string,
    newBranch: formData.get("newBranch") as string,
    githubToken: formData.get("githubToken") as string,
    systemMessage: formData.get("systemMessage") as string,
    userMessage: formData.get("userMessage") as string,
    excludeList: formData.get("excludeList") as string
  }

  // validate form data
  const validatedData = pullRequestSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      success: false,
      message: "Errors in form input",
      errors: validatedData.error.flatten().fieldErrors,
      inputs: rawData,
    }
  }

  const { success: repoSuccess, message: repoMessage, codebase } = await getRepoCodebase(validatedData.data.repoOwner, validatedData.data.repoName, validatedData.data.githubToken)

  if (!repoSuccess) {
    return {
      success: false,
      message: repoMessage,
      inputs: rawData
    }
  }

  // format repo codebase into one giant string
  const formattedRepoContents = formatRepoContents(codebase)

  // insert codebase into system prompt
  const systemPrompt = validatedData.data.systemMessage.replace("{REPO_CONTENT}", formattedRepoContents)

  // generate the pull request with content ai
  const { success, message, data } = await generatePullRequest(systemPrompt, validatedData.data.userMessage)

  if (!success) {
    return {
      success: false,
      message,
      inputs: rawData,
    }
  }

  return {
    success: true,
    message: "Submission form saved successfully",
    inputs: rawData,
    data,
    codebase
  }
}

export async function submitPullRequest(formState: PRFormActionResponse): Promise<CreatePRResponse> {
  if (!formState.success || !formState.data || !formState.inputs) {
    return {
      success: false,
      message: "Error creating pull request. 'formState' is missing data.",
      pr: null
    }
  }
  try {
    const github = new GithubService(formState.inputs?.repoOwner, formState.inputs?.repoName, formState.inputs?.githubToken)

    // get base branch
    const defaultBranch = await github.getDefaultBranch()

    // create new branch for pull request
    await github.createBranch(formState.inputs?.newBranch, defaultBranch)

    // creata/update files included in pull request
    await github.updateFiles(formState?.inputs?.newBranch, formState?.data?.files)

    // add the original user prompt to the body of the pull request
    const prBody = `Prompt: ${formState?.inputs?.userMessage}\n\n${formState?.data?.prMetadata.body}`

    // create pull request
    const pr = await github.createPullRequest(
      formState?.data.prMetadata.title,
      prBody,
      formState?.inputs?.newBranch,
      defaultBranch
    )

    // create pull request comment with model's reasoning
    await github.addPullRequestComment(
      pr.number,
      `## AI Model's Reasoning Process\n\n${formState?.data?.reasoning}\n\n## Generated Files\n${formState?.data.files.map((f) => `- ${f.path}`).join("\n")}`
    )

    console.log("Pull request successfully created:", pr.html_url)

    return {
      success: true,
      message: `Pull request successfully created: ${pr.html_url}`,
      pr
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      message: `Error creating pull request: ${err}`,
      pr: null
    }
  }
}