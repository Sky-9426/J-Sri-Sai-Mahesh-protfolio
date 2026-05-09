# ✅ Portfolio Fix Verification Checklist

## Run This to Test Everything

### Step 1: Start the Development Server
```bash
cd c:\Users\jsris\Desktop\mahesh-portfolio-uploaded
npm run dev
```
Then open: http://localhost:3000

---

## ✅ Feature Checklist

### Terminal Features
- [ ] **Terminal opens** when desktop loads (double-click icon or auto-open)
- [ ] **Type `help`** → See list of all available commands
- [ ] **Type `cat resume.pdf`** → Full resume displays with education, experience, skills
- [ ] **Type `cat projects.txt`** → All 4 projects display with descriptions
- [ ] **Type `cat skills.txt`** → Detailed skills breakdown shows
- [ ] **Type `ls`** → File listing shows resume.pdf, projects folder, etc.
- [ ] **Type `pwd`** → Shows current directory (/home/mahesh)
- [ ] **Terminal accepts other commands** (cd, mkdir, touch, echo, ps, etc.)

### Profile Picture (PFP)
- [ ] **Top bar shows avatar** on left side next to "mahesh@ubuntu"
- [ ] **Avatar is visible** (either your uploaded photo or "M" gradient)
- [ ] **Photo is small circle** (5x5 or similar size)
- [ ] **Orange border** around avatar in top bar
- [ ] **System menu shows photo** when power icon clicked (if uploaded)

### Text Editor
- [ ] **Text Editor app opens** from desktop or Activities
- [ ] **File, Edit, View, Help menus appear** at top
- [ ] **Click File menu** → Shows "New File", "Save", "Close Tab" options
- [ ] **Click Edit menu** → Shows "Undo", "Redo", "Find", "Replace" options
- [ ] **Click View menu** → Shows "Word Wrap", "Zen Mode", "Toggle Line Numbers"
- [ ] **Click Help menu** → Shows "About", "Keyboard Shortcuts"
- [ ] **Save button works** (green arrow button)
- [ ] **Can create new tabs** with "+ New" button
- [ ] **Can edit notes.txt file**
- [ ] **README.md shows your name and info**

### Settings Panel
- [ ] **Settings app opens** from desktop
- [ ] **Appearance section shows**
  - [ ] Dark Mode toggle (works)
  - [ ] Change Wallpaper button (works)
- [ ] **Notifications section shows** toggle
- [ ] **Network section shows** Wi-Fi toggle
- [ ] **Sound section shows** Volume slider
- [ ] **Display section shows** Brightness slider
- [ ] **Users section shows** "mahesh (Administrator)"
- [ ] **About section shows** Ubuntu 22.04.3 LTS

### File Manager
- [ ] **Files app opens** from desktop
- [ ] **Shows folder structure**: /home/mahesh
- [ ] **Folders visible**: Desktop, Documents, Downloads, portfolio, projects
- [ ] **Protected files marked** with lock icon 🔒
- [ ] **Can toggle grid/list view** with button
- [ ] **Can create new files/folders** with "+ New" button
- [ ] **Can delete user-created files** (right-click or delete button)
- [ ] **Cannot delete protected files** (shows warning)

### Photo Viewer
- [ ] **Photo Viewer app opens** from desktop
- [ ] **Shows upload instructions** if no photo uploaded
- [ ] **Can toggle between ASCII/Pixel/Original views
- [ ] **If photo uploaded**: Shows in different rendering modes

### Browser
- [ ] **Browser app opens** with mahesh:// URLs
- [ ] **mahesh://home** shows portfolio info
- [ ] **mahesh://projects** shows project browser
- [ ] **mahesh://portfolio** shows achievements

### Top Bar & System Menu
- [ ] **Clock shows** correct date and time
- [ ] **Activities button opens** app launcher
- [ ] **Power button shows** system menu
- [ ] **System menu has options**: Settings, Change Wallpaper, About Ubuntu, Log Out, Restart, Power Off
- [ ] **Wallpapers change** when "Change Wallpaper" clicked
- [ ] **Can minimize/maximize/close windows**
- [ ] **Can drag windows** around desktop
- [ ] **Can resize windows** from corner

---

## 🐛 Common Test Scenarios

### Test 1: Resume Content
```bash
# In terminal:
cat resume.pdf
```
**Should show**:
- Your full name
- Contact info (email, phone, LinkedIn)
- Education (B.Tech ECE, GPA 8.30)
- Experience (IIT Bhubaneswar, Tropoleap)
- Skills (C, C++, Python, ESP32, etc.)

### Test 2: Projects Content
```bash
# In terminal:
cat projects.txt
```
**Should show**:
1. Fire Surveillance Bot (Published)
2. AI Recycling Vending Machine (Deployed)
3. Coastal Behaviour Framework (Research)
4. Tropoleap Embedded Systems (In Progress)

### Test 3: Text Editor Menus
1. Click "File" menu
2. Click "New File"
3. Enter filename: "test.txt"
4. Type some text
5. Click "Save"
6. File should download

### Test 4: Photo Avatar
1. Look at top-left of screen
2. Should see small circular avatar with "M" or your photo
3. Avatar should have orange border
4. Location: next to "mahesh@ubuntu" text

### Test 5: Settings
1. Open Settings app
2. Click "Appearance"
3. Toggle "Dark Mode" (should affect theme)
4. Click "Change Wallpaper"
5. Desktop background should change

---

## ⚠️ Things NOT Fixed (Limitations)

| Issue | Status | Reason |
|-------|--------|--------|
| Photo on other devices | 👷 IN PROGRESS | Requires backend/database (localStorage limitation) |
| Real file opening | 📝 SIMULATED | This is a web-based simulator, not real files |
| Terminal execution | 🎭 SIMULATED | Commands are simulated, not real shell |
| Edit mode for main files | 🔒 PROTECTED | Resume/Projects/Skills are read-only by design |

---

## 📊 Build Status

### Last Build (npm run build)
```
✅ Compiled successfully
✅ Generated static pages (6/6)
✅ No TypeScript errors
✅ Ready for deployment
```

---

## 🎯 Quick Fixes Applied

1. ✅ **PFP added to top bar**
   - Shows circular avatar next to "mahesh@ubuntu"
   - Loads from localStorage or shows gradient avatar

2. ✅ **Resume content populated**
   - Accessible via `cat resume.pdf` in terminal
   - Complete education, experience, skills, achievements

3. ✅ **Projects content populated**
   - Accessible via `cat projects.txt` in terminal
   - All 4 projects with detailed descriptions

4. ✅ **Text editor menus implemented**
   - File, Edit, View, Help menus now clickable
   - Dropdown menus with working options

5. ✅ **Terminal enhanced**
   - Help command shows all available commands
   - Resume, projects, skills files viewable
   - 40+ commands supported

---

## 🚀 Deployment Ready?

✅ **YES!** Build compiles successfully. Ready to deploy.

**Only remaining task**: Add default photo to fix persistence (see `FIX_PHOTO_PERSISTENCE.md`)

---

## Need to check something?

### Common locations:
- **Main component**: `components/UbuntuDesktop.tsx`
- **Styles**: `app/globals.css` and `tailwind.config.ts`
- **Data**: `lib/data.ts`
- **Admin panel**: `app/admin/page.tsx`

### Run tests:
```bash
# Dev server
npm run dev

# Build check
npm run build

# Lint check
npm run lint
```

---

**Last tested**: Build successful ✅
**Status**: Production ready (except photo persistence)
Let me know if you need any clarifications!
