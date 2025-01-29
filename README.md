# GitHub PR Automation Tool

A Next.js application that automates the creation of GitHub pull requests using AI-powered content generation.

## Overview
This tool helps developers automate the process of creating pull requests (PRs) by generating PR content and updated files using AI. It provides a simple form-based interface where users can input their GitHub repository details and receive AI-generated PR content.

## Key Features

- **GitHub Integration**: Direct integration with GitHub API for creating branches and pull requests
- **AI-Powered Generation**: Uses AI to generate PR content and file changes based on repository context
- **Form-Based Interface**: Simple form for inputting repository details and custom messages
- **File Management**: Handles file updates and creation within the repository
- **PR Automation**: Automatically creates new branches and submits pull requests

## How It Works

1. Users provide their GitHub repository details and personal access token
2. The application fetches repository content and analyzes it
3. AI generates proposed changes and PR content based on the repository context
4. Users review and submit the generated PR through the interface
5. The application creates a new branch and submits the pull request

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up required environment variables:
   - NEXT_PUBLIC_FORM_GITHUB_PAT (optional GitHub PAT for pre-filling form)
   - NEXT_PUBLIC_FORM_GITHUB_REPO_OWNER (optional default repo owner)
   - NEXT_PUBLIC_FORM_GITHUB_REPO_NAME (optional default repo name)
   - NEXT_PUBLIC_FORM_GITHUB_REPO_BASE_BRANCH (optional default base branch)

4. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

The application can be configured through environment variables to set default values for the form inputs. This makes it easier to use the tool for specific repositories or organizations.