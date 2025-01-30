export interface PRFormData {
  repoOwner: string
  repoName: string
  baseBranch: string
  newBranch: string
  githubToken: string
  systemMessage: string
  userMessage: string
  excludeList: string
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

export interface PRFormActionResponse {
  success: boolean
  message: string
  inputs?: PRFormData
  errors?: {
    [K in keyof PRFormData]?: string[]
  }
  codebase?: FileContent[]
  data?: {
    response: string
    reasoning: string | undefined
    prMetadata: PRMetadata
    files: FileContent[]
  }
}

export interface GHRepoCodebaseActionResponse {
  success: boolean
  message: string
  codebase: FileContent[]
}

export interface PRActionResponse {
  success: boolean
  message: string
  data?: {
    response: string
    reasoning: string | undefined
    prMetadata: PRMetadata
    files: FileContent[]
  }
}

export interface CreatePRResponse {
  success: boolean
  message: string
  pr: Record<string, any> | null
}