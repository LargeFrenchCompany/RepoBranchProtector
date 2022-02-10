import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { App, createNodeMiddleware } from "octokit";
import 'dotenv/config'

const app = new App({
  appId: process.env.GITHUB_APP_IDENTIFIER,
  privateKey: process.env.PRIVATE_KEY,
  oauth: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET },
});

// Creates a new README file file in a repository.
// This will by default create a new "main" branch.
function createInitialBranch(octokit, payload){
    let data = 'This is your repository README';
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    return octokit.rest.repos.createOrUpdateFileContents({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        path: 'Readme.md',
        message: 'Creating initial Readme file',
        content: base64data
    });
}

// Apply Branch protection rules to the main branch
function updateBranchProtection(octokit, payload){
    return octokit.rest.repos.updateBranchProtection({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        branch: 'main',
        required_status_checks: null,
        enforce_admins: true,
        required_pull_request_reviews: {
            required_approving_review_count: 1,
            dismiss_stale_reviews: true
        },
        restrictions: null,
        required_conversation_resolution: true
    })
}

// Create an issue and mention the Owner to explain the added protections
function createIssueMention(octokit, payload){
    return octokit.rest.issues.create({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        title: "The main branch is now protected!",
        body: `@danielmeppiel, several default protection rules were applied to the \`main\` branch:\n` +
        "- You can only merge changes via a Pull Request\n"+
        "- Pull Requests have to be reviewed and approved by at least 1 other collaborator\n"+
        "- New commits to approved Pull Requests invalidate stale approvals\n" +
        "- The Pull Request author must resolve all open conversations on it before merging"
    });
}

app.webhooks.on("repository.created", async ({ octokit, payload }) => {
    console.log('A new repositoriy was created!');
    console.log('Creating initial branch by pushing a Readme.md file...');
    await createInitialBranch(octokit, payload);
    console.log('Applying protections to the main branch...');
    await updateBranchProtection(octokit, payload);
    console.log('Notifying the user...');
    await createIssueMention(octokit, payload);
});

// Your app can now receive webhook events at `/api/github/webhooks`
console.log('Listening on port 3000 at /api/github/webhooks...');
require("http").createServer(createNodeMiddleware(app)).listen(3000);