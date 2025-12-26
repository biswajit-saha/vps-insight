# VPS Insight — Installation Guide

This guide helps you install the VPS Insight monitoring agent on a single VPS
and connect it to a Cloudflare Worker dashboard.

One VPS = one dashboard  
Fully works on Cloudflare free tier  
Designed to be transparent about refresh timing  

---

## Prerequisites

Before installing the agent, make sure you have:

- A Cloudflare account
- A Cloudflare Worker deployed
- A KV namespace bound to the Worker
- An API token configured in the Worker
- The Worker URL (example: `https://vps-insight-prod.workers.dev`)

## Cloudflare setup (CLI method)

This section uses the **Wrangler CLI** to create and deploy everything.
You do NOT need to use the Cloudflare dashboard except for login.

---

### Step 0: Install Wrangler

Node.js is required (v18+ recommended).

```bash
npm install -g wrangler
```

Verify:
```hash
wrangler --version
```

### Step 1: Login to Cloudflare

```bash
wrangler login
```
This will open a browser window.
Log in to Cloudflare and approve access.
Return to the terminal after success.

### Step 2: Create KV Namespace

From the project root:

```bash
wrangler kv namespace create VPS_INSIGHT_DATA
```

Output will look like:

```python
🌀 Creating namespace with title "VPS_INSIGHT_DATA"
✨ Success!
Add the following to your wrangler.toml:
kv_namespaces = [
  { binding = "VPS_KV", id = "xxxxxxxxxxxxxxxxxxxx" }
]
```

Copy the id value.

### Step 3: Configure wrangler.toml

Open `worker/wrangler.toml` and ensure it contains:

```toml
name = "vps-insight-prod"
main = "src/index.js"
compatibility_date = "2024-01-01"

kv_namespaces = [
  { binding = "VPS_KV", id = "PASTE_ID_HERE" }
]
```

Replace PASTE_ID_HERE with the ID from Step 2.

### Step 4: Set API token secret

Generate a strong random token (example):

```bash
openssl rand -hex 32
```

Set it as a Worker secret:

```bash
wrangler secret put API_TOKEN
```

Paste the token when prompted.
This same token will be used during VPS agent installation.

### Step 5: Deploy the Worker

From the `worker` directory:

```bash
cd worker
wrangler deploy
```

On success, you will see:

```bash
Published vps-insight-prod
https://vps-insight-prod.yourname.workers.dev
```

This URL is your Worker base URL.

---

### Dashboard deployment (CLI)

If using Cloudflare Pages:

```bash
cd frontend
wrangler pages deploy .
```

Follow prompts to create a Pages project.

The dashboard automatically reads data from the Worker.

### Required values for VPS install

You now have everything needed:

- Worker URL. Example: `https://vps-insight-prod.yourname.workers.dev`


- API token(the secret you created)

You can now install the VPS agent.

---

## Install the VPS agent (recommended)

Run this on your VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/biswajit-saha/vps-insight/main/install.sh | sudo bash
```

The installer will ask for:

- Worker URL (example: `https://vps-insight-prod.workers.dev`)
- API token (must match the Worker secret)
- Server name (example: gbj-prod-1)

The installer will automatically:

- Install the agent binary
- Write configuration to `/etc/vps-insight/config.env`
- Create a systemd service
- Enable and start the service

No extra commands needed.

## Verify installation

```bash
systemctl status vps-insight
```

You should see the service running

## Updating VPS Insight

To update the agent later:

```bash
sudo vps-insight update
```

This pulls the latest version and restarts the service safely.

## Alternative: manual install (optional)

For users who prefer cloning the repository:

```bash
git clone https://github.com/biswajit-saha/vps-insight.git
cd vps-insight/agent
sudo bash install.sh
```

Same prompts, same result.

## Uninstall (manual)

```bash
sudo systemctl stop vps-insight
sudo systemctl disable vps-insight
sudo rm -rf /etc/vps-insight /usr/local/bin/vps-insight
sudo rm /etc/systemd/system/vps-insight.service
sudo systemctl daemon-reload
```