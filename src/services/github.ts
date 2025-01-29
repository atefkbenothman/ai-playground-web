import { Octokit } from "@octokit/rest"

export class GithubService {
  private owner: string
  private repo: string
  private oktokit: Octokit

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner
    this.repo = repo
    this.oktokit = new Octokit({ auth: token })
  }

  async getRepo() {
    const { data } = await this.oktokit.repos.get({
      owner: this.owner,
      repo: this.repo
    })
    return data
  }

  async getDefaultBranch(): Promise<string> {
    const repo = await this.getRepo()
    return repo.default_branch
  }

  async createBranch(newBranch: string, defaultBranch: string): Promise<void> {
    const { data } = await this.oktokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${defaultBranch}`
    })
    await this.oktokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${newBranch}`,
      sha: data.object.sha
    })
  }

  private async getFileSha(path: string): Promise<string | null> {
    try {
      const { data } = await this.oktokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path
      })
      if (data && "sha" in data) {
        return data.sha
      }
      return null
    } catch (error) {
      return null
    }
  }

  async updateFiles(branchName: string, files: { path: string, content: string }[]): Promise<void> {
    for (const file of files) {
      try {
        const sha = await this.getFileSha(file.path)

        await this.oktokit.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: file.path,
          message: sha ? `Update ${file.path}` : `Create ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
          sha: sha ?? undefined,
          branch: branchName
        })
      } catch (error) {
        console.error(`Error updating file ${file.path}: ${error}`)
      }
    }
  }

  async createPullRequest(title: string, body: string, headBranch: string, baseBranch: string) {
    const { data } = await this.oktokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: title,
      body: body,
      head: headBranch,
      base: baseBranch
    })
    return data
  }

  async addPullRequestComment(prNumber: number, comment: string): Promise<void> {
    await this.oktokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: prNumber,
      body: comment
    })
  }

  async getRepositoryContents(path: string = "", exclude: string[] = []): Promise<Array<{ path: string, content: string }>> {
    const { data } = await this.oktokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path
    })

    // single file
    if (!Array.isArray(data)) {
      if (data.type === "file") {
        if (!this.matchesIgnorePattern(data.path, exclude)) {
          const content = Buffer.from(data.content, "base64").toString("utf-8")
          return [{ path: data.path, content }]
        }
        return []
      }
      return []
    }

    // directory
    const contents = await Promise.all(
      data.map(async item => {
        if (this.matchesIgnorePattern(item.path, exclude)) {
          return []
        }

        if (item.type === "dir") {
          return this.getRepositoryContents(item.path, exclude)
        } else if (item.type === "file") {
          if (!this.matchesIgnorePattern(item.path, exclude)) {
            const fileData = await this.oktokit.repos.getContent({
              owner: this.owner,
              repo: this.repo,
              path: item.path
            })
            if ("content" in fileData.data) {
              const content = Buffer.from(fileData.data.content, "base64").toString("utf-8")
              return [{ path: item.path, content }]
            }
          }
          return []
        }
        return []
      })
    )

    return contents.flat().filter(Boolean)
  }

  private matchesIgnorePattern(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Convert pattern to regex
      let regexPattern = pattern.replace(/\./g, "\\.")
      regexPattern = regexPattern.replace("**", ".*").replace("*", "[^/]*")
      regexPattern = `^${regexPattern}$`

      try {
        const regex = new RegExp(regexPattern)
        return regex.test(filePath)
      } catch (error) {
        // Invalid regex pattern, skip matching
        return false
      }
    })
  }

}