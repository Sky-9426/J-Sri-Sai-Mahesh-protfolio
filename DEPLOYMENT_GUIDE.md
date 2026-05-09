# 🚀 Portfolio Deployment & Setup Guide

## ✅ Recent Improvements

Your portfolio has been enhanced with:

### 1. **Enhanced Cursor** 🎯
- Replaced standard cursor with an eye-catching animated design
- Features rotating orbit with glowing dots
- Pulsing core that captures attention
- Smooth tracking with GSAP-like animation

### 2. **Image Persistence** 🖼️
- Images now stored via cloud URLs (Vercel Blob, Cloudinary, Unsplash)
- Works for ALL visitors (not just on your local machine)
- Default fallback to professional Unsplash image
- Set custom photo via `NEXT_PUBLIC_DEFAULT_PHOTO_URL` env var

### 3. **Enhanced Profile Picture** 👤
- Glowing gradient border effect on hover
- Smooth scale animation
- Better visual hierarchy
- Works in ASCII, pixel, and original modes

### 4. **Clean Interface** 🎨
- Removed dark vignette overlay (backdrop text)
- Cleaner, brighter interface
- Better focus on content

### 5. **Interactive Engagement** ✨
- Enhanced hover effects on all terminal windows
- Glowing shadows on hover
- Smooth color transitions
- Micro-animations for better UX
- Engaging effects on skills and projects
- Smooth state transitions

---

## 🔧 Environment Setup

### Step 1: Set Photo URL
Edit `.env.local`:
```
NEXT_PUBLIC_DEFAULT_PHOTO_URL=YOUR_CLOUD_IMAGE_URL
```

**Options:**
- **Cloudinary:** `https://res.cloudinary.com/your-cloud/image/upload/c_thumb,w_400,h_400/your-photo.jpg`
- **Vercel Blob:** `https://blob.vercel-storage.com/your-key`
- **Unsplash:** `https://images.unsplash.com/photo-xxxxx?w=400&h=400&fit=crop`
- **GitHub URLs:** `https://raw.githubusercontent.com/username/repo/main/photo.jpg`

### Step 2: Update Admin Password
In `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=YourStrongPassword123!
```

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser: http://localhost:3000
```

Test the new cursor by hovering around and visiting different sections!

---

## ☁️ Deploy to Vercel (Recommended)

### Option 1: Direct Deploy
```bash
npm run build
npm install -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repo
4. Add environment variables:
   - `NEXT_PUBLIC_ADMIN_PASSWORD=YourPassword123!`
   - `NEXT_PUBLIC_DEFAULT_PHOTO_URL=YOUR_IMAGE_URL`
5. Deploy!

---

## 🌐 Deploy to Cloudflare Pages

```bash
# One-time setup
npm install -g wrangler
wrangler login

# Deploy
npm run build
npx wrangler pages deploy out --project-name=mahesh-portfolio
```

Then add environment variables in Cloudflare dashboard.

---

## 📱 Testing Checklist

- [ ] Cursor appears and glows
- [ ] Cursor rotates smoothly
- [ ] Photo displays with glowing border
- [ ] No vignette overlay visible
- [ ] Hover effects work on terminal windows
- [ ] Skills and projects have smooth transitions
- [ ] Colors match your theme (greens, cyans)
- [ ] Mobile experience is smooth
- [ ] All images load from cloud (not local)

---

## 🎯 Making It Pop for Recruiters

1. **Smooth Scroll** - Already enabled, encourage scrolling
2. **Interactive Cursor** - Catches attention immediately
3. **Glowing Effects** - Premium tech aesthetic
4. **Micro-interactions** - Keep them exploring
5. **Professional Photos** - Cloud-hosted images
6. **Clear Sections** - Easy navigation

---

## 🔗 Quick Links

- **Local:** `http://localhost:3000`
- **Admin Panel:** Type `sudo access --admin` in terminal
- **View Page:** `http://localhost:3000/view`
- **Preview:** Click "↗ preview" button in admin

---

## ⚠️ Important Notes

✅ **Do this:**
- Use environment variables for sensitive data
- Test locally before deploying
- Set a strong admin password
- Use cloud URLs for images

❌ **Don't do this:**
- Commit `.env.local` to git
- Use localhost image paths in production
- Forget to add env vars in deployment
- Share your admin password

---

## 📞 Troubleshooting

**Images not loading?**
- Check `NEXT_PUBLIC_DEFAULT_PHOTO_URL` is valid
- Test URL directly in browser
- Use CORS-friendly image sources

**Cursor not showing?**
- Check browser's pointer settings
- Works best with `hover: hover` media query
- Mobile will use default cursor

**Build fails?**
```bash
rm -rf .next
npm run build
```

---

## 🎉 You're All Set!

Your portfolio now has:
✅ Eye-catching cursor animation  
✅ Cloud-persistent images  
✅ Enhanced profile picture  
✅ Clean, modern interface  
✅ Engaging interactive elements  

Deploy it and wow those recruiters! 🚀
