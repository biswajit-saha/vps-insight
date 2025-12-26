# VPS Insight

A minimal VPS monitoring setup.

One VPS = one dashboard  
Runs fully on Cloudflare free tier  
Transparent about refresh timing  
No login, no backend server to maintain

Author: https://github.com/biswajit-saha

---

## What this repo contains

- `agent/`  
  A lightweight system agent that runs on your VPS and sends metrics

- `worker/`  
  Cloudflare Worker + KV that receives and serves metrics

- `dashboard/`  
  Static HTML dashboard (can be hosted on Cloudflare Pages)

---

## High-level flow

VPS Agent → Cloudflare Worker → Cloudflare KV → Dashboard

The agent sends metrics every few seconds.  
The dashboard auto-refreshes and clearly shows how fresh the data is.

---

## Requirements

On your VPS:
- Linux (systemd based)
- curl
- bash

Cloudflare account (free):
- Workers
- KV
- Pages (or any static hosting)

---

## Installation

See `INSTALL.md`

This file only explains **what the project is**.  
All step-by-step instructions are in `INSTALL.md`.
