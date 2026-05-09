# Mahesh Portfolio — 3-Page System

## Pages
| Route    | Who        | Description                              |
|----------|------------|------------------------------------------|
| `/`      | Everyone   | Terminal login — type commands to explore|
| `/view`  | Everyone   | Full public portfolio (read-only)        |
| `/admin` | Only you   | Live editable dashboard (password gated) |

---

## 🔐 Setting Up Your Admin Password

### Local Dev
```bash
cp .env.example .env.local
# Edit .env.local and set:
NEXT_PUBLIC_ADMIN_PASSWORD=YourStrongPassword123!
```

### Cloudflare Pages (Production)
1. Go to **dash.cloudflare.com** → Pages → mahesh-portfolio
2. **Settings** → **Environment variables**
3. Add variable:
   - Name:  `NEXT_PUBLIC_ADMIN_PASSWORD`
   - Value: `YourStrongPassword123!`
4. Click **Save** and **redeploy**

---

## 🚀 Local Dev
```bash
npm install
npm run dev        # http://localhost:3000
```

## ☁️ Deploy to Cloudflare Pages

### One-time setup
```bash
npm install -g wrangler
wrangler login
```

### Build & Deploy
```bash
npm run build
npx wrangler pages deploy out --project-name=mahesh-portfolio
```

### OR via GitHub (auto-deploy on push)
1. Push to GitHub
2. Cloudflare Pages → Create project → Connect Git
3. Build command: `npm run build`
4. Output dir: `out`
5. Add env var `NEXT_PUBLIC_ADMIN_PASSWORD` in Settings

---

## 🔑 How to Access Admin Panel
1. Go to your portfolio URL (e.g. `mahesh-portfolio.pages.dev`)
2. In the terminal, type: `sudo access --admin`  
3. Enter your password when prompted
4. You'll be redirected to `/admin`

---

## ✏️ Editing Content
- Login to `/admin`
- Use the tabs: **info · experience · projects · skills · achievements**
- Click **save changes** — updates persist in browser localStorage
- Click **↗ preview** to see the live `/view` page

## ⚠️ Security Notes
- Password is stored as env var, never in source code
- Session expires when browser tab is closed (sessionStorage)
- 3 failed attempts locks the session
- Admin route redirects to `/` if not authenticated
