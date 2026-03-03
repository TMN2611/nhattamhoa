# Project Overview

A Vietnamese-language Next.js 16 web application with a luxury/lifestyle theme. Built with TypeScript, Tailwind CSS v4, and shadcn/ui components.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: pnpm

## Pages

- `/` - Home page
- `/checkout` - Checkout flow
- `/chon-vat-chung` - Product selection
- `/hoi-dap` - FAQ
- `/khoanh-khac` - Moments
- `/kich-hoat` - Activation
- `/loi-the` - Benefits
- `/nghe-thuat-bao-ton` - Conservation art
- `/nghi-thuc` - Ceremony
- `/quy-uoc` - Conventions
- `/san-sang` - Ready
- `/ve-chung-toi` - About us
- `/product/[id]` - Product detail

## Dev Setup

- Dev server runs on `0.0.0.0:5000` via `pnpm run dev`
- `next.config.mjs` has `allowedDevOrigins: ["*"]` for Replit proxy support

## Deployment

- Target: autoscale
- Build: `pnpm run build`
- Run: `pnpm run start`
