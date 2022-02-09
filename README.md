# RepoBranchProtector
A GitHub App that automates the protection of the default branch of newly created repositories.

This App will apply the following branch protections whenever a new repository is created under the organisation:
- A Pull Request will be neccessary whenever pushing changes to the default branch
- At least 1 approval will be required for a Pull Request to be merged
- Stale approvals will be discarded when new commits are pushed to a Pull Request
- All conversations of a Pull Request must be resolved before merging it

In addition, a `Readme.md` file will be created in each new repository, so that a default `main` branch is created. This is needed in order to set protection rules on the branch.

## Setup

You need to first install this GitHub App in your organisation and then run it on a server of your choice:

### Setup a new GitHub App
1. Create a new GitHub App under your **Organization Settings -> GitHub Apps**. 
2. Activate **Webhook events** and provide your server's callback URL as the Webhook URL. New repository creation events will be sent to this URL. 
3. Enter a **Webhook secret** that you can remember afterwards.
4. Generate a **Private Key** and store it in a folder where you'll be able to find it later.
5. Generate a new **Client Secret** and take note of it. 

Now, under the new **GitHub App permissions and events**, setup the following:
* **Administration**: Read & Write
* **Issues**: Read & Write
* **Single file**: Read & Write, add `Readme.md` as a path. 
* Activate subscription to **Repository events**.

Finally, **install the GitHub app in your Organisation**: On the left-hand sidebar, click **Install App**, select your Organisation and grant access to all existing and new repositories. 

### Setup the App server
We now need to setup and run the server listening and acting on **Repository events**:

1. Clone this repository under a folder of your choice.
2. Create a `.env` file inside the cloned folder in your machine and add the following key-value pairs:
```
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<your RSA private key>
-----END RSA PRIVATE KEY-----"
GITHUB_APP_IDENTIFIER=<your_app_id>
GITHUB_WEBHOOK_SECRET=<your_webhook_secret>
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_webhook_secret>
```
>You can find the GitHub App ID and Client ID in your GitHub App's configuration webpage. You should have noted your Client Secret and Webhook Secret from the previous step. In order to obtain the raw RSA Private Key value, you can use a text editor or a command such as ```cat path/to/your/private-key.pem``` to read the `.pem` file you downloaded during the GitHub App creation stage.

3. Make sure you have a recent version of [Node.js](https://nodejs.org/en/download/) installed and run the server with the following command:
```
node app.js
```
The App Server will be listening to events on port `3000` under the path `/api/github/webhooks`. If installing a proxy server in front of the app server, make sure to redirect requests to `/api/github/webhooks`. If you intend to test locally using a tool such as `Smee.io`, you can use the following command to initiate a tunnel correctly:
```
smee --url <your_smee_channel_url> --path /api/github/webhooks --port 3000
```