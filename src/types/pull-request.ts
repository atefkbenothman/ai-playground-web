export interface PRFormData {
  repoOwner: string
  repoName: string
  baseBranch: string
  newBranch: string
  githubToken: string
  systemMessage: string
  userMessage: string
}

export type PRMetadata = {
  title: string
  body: string
}

export type FileContent = {
  path: string
  content: string
}

export type PRContent = {
  prMetadata: PRMetadata
  files: FileContent[]
}

export interface ActionResponse {
  success: boolean
  message: string
  inputs?: PRFormData
  errors?: {
    [K in keyof PRFormData]?: string[]
  }
  aiResponse?: {
    response: string
    reasoning?: string
  }
}