# 🔐 Security Fix Guide - API Key Leak

## ⚠️ CRITICAL: Your API keys were exposed in git history and are publicly visible on GitHub!

### 🚨 IMMEDIATE ACTIONS (Do These NOW):

#### 1. **Revoke Your Gemini API Key**
   - Go to: https://aistudio.google.com/apikey
   - Find key: `AIzaSyDaK7biqAn7mD4fv-UdPgcMFjzyxitu6Vk`
   - Click "Delete" or "Revoke"
   - Generate a new API key
   - Save it securely in your local `.env` file only

#### 2. **Secure Your Firebase Project**
   - Go to: https://console.firebase.google.com/project/mememyphoto-3019b/settings/general
   - Enable **App Check** to prevent unauthorized usage
   - Under Authentication → Settings → Authorized domains
   - Remove any suspicious domains
   - Consider rotating your Firebase app if you see unusual activity

#### 3. **Check for Unauthorized Usage**
   - Gemini API: Check usage at https://aistudio.google.com/apikey
   - Firebase: Check usage in Firebase Console → Usage tab
   - Look for unexpected spikes in requests

---

### 🛠️ FIX THE REPOSITORY:

#### Option A: Using BFG Repo-Cleaner (Recommended - Fastest)

```bash
# Install BFG
# On Ubuntu/Debian:
sudo apt-get install bfg

# Or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clean the repository
cd /home/vivek/Downloads/meme-your-pic
bfg --delete-files .env
bfg --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

#### Option B: Using git filter-repo (More thorough)

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Clean the repository
cd /home/vivek/Downloads/meme-your-pic
git filter-repo --invert-paths --path .env --path .env.local --force

# Force push
git push origin --force --all
git push origin --force --tags
```

#### Option C: Nuclear Option (Start Fresh - Simplest)

If you don't have important git history:

```bash
# 1. Backup your current code
cp -r /home/vivek/Downloads/meme-your-pic /home/vivek/Downloads/meme-your-pic-backup

# 2. Delete .git folder
cd /home/vivek/Downloads/meme-your-pic
rm -rf .git

# 3. Initialize fresh repo
git init
git add .
git commit -m "Initial commit with secure configuration"

# 4. Force push to GitHub
git remote add origin https://github.com/vivekvsingh19/memeMyPic.git
git push -u origin main --force
```

---

### ✅ PREVENT FUTURE LEAKS:

1. **Never commit sensitive files**
   - `.env` is already in `.gitignore` ✓
   - Always use `.env.example` for templates ✓

2. **Use environment variables for production**
   - Vercel/Netlify: Add env vars in dashboard
   - Never hardcode API keys in code

3. **Add pre-commit hook** (Optional but recommended):

```bash
# Install git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install

# Setup in your repo
cd /home/vivek/Downloads/meme-your-pic
git secrets --install
git secrets --register-aws
git secrets --add 'AIza[0-9A-Za-z\\-_]{35}'
```

---

### 📋 CHECKLIST:

- [ ] Revoked Gemini API key
- [ ] Created new Gemini API key
- [ ] Updated local `.env` with new key
- [ ] Checked Firebase for unauthorized usage
- [ ] Enabled Firebase App Check
- [ ] Cleaned git history (chose one option above)
- [ ] Force pushed clean history to GitHub
- [ ] Verified `.env` is not in GitHub repo
- [ ] Added `.env.example` to repo
- [ ] Updated deployment platform env vars (Vercel/Netlify)

---

### 🔍 Verify the Fix:

After cleaning, check that keys are gone:

```bash
# Clone a fresh copy and search for keys
cd /tmp
git clone https://github.com/vivekvsingh19/memeMyPic.git test-clone
cd test-clone
git log --all --full-history --source --find-object=<(echo "AIza") -- .env
```

If no results, you're clean! 🎉
