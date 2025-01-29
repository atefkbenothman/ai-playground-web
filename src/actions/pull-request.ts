"use server"

import { z } from "zod"
import { ActionResponse, PRFormData } from "@/types/pull-request"
import { GithubService } from "@/services/github"
import { extractModelResponse, formatRepoContents, parseXMLFromResponse } from "@/lib/parser"
import { generateAIResponse } from "@/services/ai"
import { FILE_EXCLUDE_LIST } from "@/lib/config"


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
        inputs: rawData,
        errors: validatedData.error.flatten().fieldErrors
      }
    }

    const githubRepo = validatedData.data.repoName
    const githubToken = validatedData.data.githubToken
    const repoOwner = validatedData.data.repoOwner
    const baseSystemPrompt = validatedData.data.systemMessage
    const userPrompt = validatedData.data.userMessage
    const newBranch = validatedData.data.newBranch

    // setup github service
    const github = new GithubService(repoOwner, githubRepo, githubToken)

    // retrieve repo codebase
    console.log("Fetching files from repo:", githubRepo)
    const repoContent = await github.getRepositoryContents("", FILE_EXCLUDE_LIST)

    console.log("\nRepository files sorted by content length:")
    const sortedFiles = repoContent.sort((a, b) => b.content.length - a.content.length)
    sortedFiles.forEach(file => {
      console.log(`- File: ${file.path} (${file.content.length} characters)`)
    })

    console.log(`Total characters in all files: ${sortedFiles.reduce((acc, file) => acc + file.content.length, 0)}`)

    // format repo codebase into one giant string
    const formattedRepoContents = formatRepoContents(repoContent)

    // format system prompt
    const systemPrompt = baseSystemPrompt.replace("{REPO_CONTENT}", formattedRepoContents)

    const { response, reasoning } = await generateAIResponse(systemPrompt, userPrompt)

    // parse xml portion of response
    // extract pr metadata and updated files content from xml
    const content = parseXMLFromResponse(response)
    const { prMetadata, files } = await extractModelResponse(content)

    const defaultBranch = await github.getDefaultBranch()

    // create new branch for PR
    await github.createBranch(newBranch, defaultBranch)

    // create/update files included in PR
    await github.updateFiles(newBranch, files)

    // create PR
    const pr = await github.createPullRequest(prMetadata.title, prMetadata.body, newBranch, defaultBranch)

    // create PR comment with model's reasoning
    await github.addPullRequestComment(pr.number, `## AI Model's Reasoning Process\n\n${reasoning}\n\n## Generated Files\n${files.map((f) => `- ${f.path}`).join("\n")}`)

    console.log("Pull request successfully created:", pr.html_url)

    return {
      success: true,
      message: "PR form saved successfully",
      inputs: rawData,
      aiResponse: {
        response,
        reasoning
      }
    }
  } catch (err) {
    return {
      success: false,
      message: "An unexpected error occurred"
    }
  }
}