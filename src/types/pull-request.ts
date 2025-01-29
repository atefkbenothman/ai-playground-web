export interface PRFormData {
  repoOwner: string
  repoName: string
  baseBranch: string
  newBranch: string
  githubToken: string
  systemMessage: string
  userMessage: string
}

export interface ActionResponse {
  success: boolean
  message: string
  errors?: {
    [K in keyof PRFormData]?: string[]
  }
}