import * as core from "@actions/core";
import * as github from "@actions/github";
import { buildPrompt } from "./prompt";
import { generateSummary } from "./openai";

export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput("openai-api-key", { required: true });
    const model = core.getInput("model") || "gpt-4o-mini";
    const diff = core.getInput("diff", { required: true });
    const commitsRaw = core.getInput("commits") || "[]";

    let commits: Array<{ message: string; sha: string }> = [];
    try {
      commits = JSON.parse(commitsRaw);
    } catch {
      core.warning("Could not parse commits input; proceeding without commits.");
    }

    const prompt = buildPrompt({ diff, commits });
    core.debug(`Prompt length: ${prompt.length} characters`);

    const { summary, tokensUsed } = await generateSummary(prompt, apiKey, model);

    core.setOutput("summary", summary);
    core.setOutput("tokens-used", String(tokensUsed));
    core.info(`PR summary generated (${tokensUsed} tokens used).`);

    const token = core.getInput("github-token");
    if (token) {
      const octokit = github.getOctokit(token);
      const { context } = github;
      const prNumber = context.payload.pull_request?.number;

      if (prNumber) {
        await octokit.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: prNumber,
          body: `### 📋 PR Summary\n\n${summary}`,
        });
        core.info("Summary posted as a PR comment.");
      } else {
        core.warning("No pull_request context found; skipping comment.");
      }
    }
  } catch (error) {
    core.setFailed(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

run();
