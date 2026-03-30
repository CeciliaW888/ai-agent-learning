# 🚀 Deploy Guide

Two options to get your course website live.

## Option 1: GitHub Pages (Recommended)

### Automatic (GitHub Actions)
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **GitHub Actions**
4. The workflow in `.github/workflows/deploy.yml` auto-deploys on every push
5. Your site: `https://YOUR_USERNAME.github.io/ai-agent-learning/`

### Manual
1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main`, Folder: `/website`
4. Save → site deploys in ~1 min

## Option 2: Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Root Directory:** `website`
4. **Framework Preset:** Other
5. Click Deploy
6. Your site: `https://ai-agent-learning.vercel.app`

## Custom Domain (Optional)

### GitHub Pages
1. Settings → Pages → Custom domain
2. Add your domain
3. Add DNS records (CNAME or A records)

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Follow DNS instructions

## Local Preview

```bash
cd website
python -m http.server 8000
# Open http://localhost:8000
```

Or just open `website/index.html` in your browser — it's a single file, no build step needed!
