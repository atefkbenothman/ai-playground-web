
import { NextResponse } from "next/server";
import { z } from "zod";

export const formDataSchema = z.object({
  repoOwner: z.string().min(1, "Repository owner is required"),
  repoName: z.string().min(1, "Repository name is required"),
  baseBranch: z.string().min(1, "Base branch is required"),
  newBranch: z.string().min(1, "New branch is required"),
  githubToken: z.string().min(1, "GitHub token is required"),
  systemMessage: z.string().min(1, "System message is required"),
  userMessage: z.string().min(1, "User message is required"),
});

export async function handleFormData(data: Record<string, string>) {
  try {
    const parsedData = formDataSchema.parse(data);
    console.log("Form data:", parsedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
