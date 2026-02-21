# ⚡ DevPulse

Self-hosted error tracking and performance monitoring for developers.
Like Sentry, but free and runs locally via Docker.

## Quick Start

````bash
docker compose up -d
Open http://localhost:8000

SDKs
Package	Install
Laravel	composer require devpulse/laravel
WordPress	Drop plugin into wp-content/plugins/
Browser	<script src="http://localhost:8000/devpulse.js">
Repos
server — Rust + Axum ingestion server

sdks/php-core — PHP core SDK

sdks/laravel — Laravel package

sdks/wordpress — WordPress plugin

sdks/browser — Browser JS SDK

text

***

## Step 5 — First Commit and Push Main Repo

```bash
# Create main repo on GitHub first: yourname/devpulse
git add .
git commit -m "chore: init monorepo with submodules"
git remote add origin git@github.com:yourname/devpulse.git
git push -u origin main
Step 6 — How to Clone Later (Anyone)
bash
# Clone everything including all submodules in one command
git clone --recurse-submodules git@github.com:yourname/devpulse.git
Daily Workflow After This
bash
# Work in a submodule (e.g. server)
cd server
git add .
git commit -m "fix: improve fingerprinting"
git push origin main

# Update main repo to point to latest submodule commit
cd ..
git add server
git commit -m "chore: update server submodule"
git push origin main
Update All Submodules at Once
bash
# Pull latest changes from all submodules
git submodule update --remote --merge
What's your GitHub username? I can give you the exact commands with your real repo URLs.
````
