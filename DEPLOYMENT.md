# Deployment Guide - Netflix Movie App

This guide will help you deploy your Netflix Movie App to production.

## Architecture

- **Frontend**: Netlify (Static hosting)
- **Backend**: Render (Node.js + Express)
- **Database**: Aiven MySQL (Cloud)
- **API**: OMDb API (Movie data)

---

## Step 1: Deploy Backend to Render

### 1.1 Push Code to GitHub

Make sure your code is in a GitHub repository:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Create Render Account

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### 1.3 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `netflix-movie-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `server` (if your server is in a subfolder)

### 1.4 Add Environment Variables

In Render Dashboard → Your Service → Environment, add:

```
NODE_ENV=production
DB_HOST=your-aiven-host
DB_USER=your-aiven-username
DB_PASSWORD=your-aiven-password
DB_NAME=your-database-name
DB_PORT=your-aiven-port
OMDB_API_KEY=your-omdb-api-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
```

**Note**: For `ALLOWED_ORIGINS`, we'll update it with your Netlify URL after Step 2.

### 1.5 Deploy

Click "Create Web Service". Render will:
1. Build your app
2. Deploy it
3. Give you a URL like: `https://netflix-movie-api-xxxxx.onrender.com`

**Important**: Render free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

## Step 2: Deploy Frontend to Netlify

### 2.1 Update Backend URL

Edit `client/js/api.js`:

```javascript
// Change this line:
const BACKEND_URL = 'http://localhost:5000';

// To your Render URL:
const BACKEND_URL = 'https://netflix-movie-api-xxxxx.onrender.com';
```

### 2.2 Deploy to Netlify

**Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Drag your `client/` folder to the deploy area
3. Netlify will give you a URL like: `https://your-app-name.netlify.app`

**Option B: GitHub Integration**
1. Connect your GitHub repo to Netlify
2. Set build settings:
   - Build command: (leave empty)
   - Publish directory: `client`
3. Deploy

### 2.3 Update CORS in Render

Go back to Render Dashboard:
1. Find your service
2. Environment → Edit
3. Update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://your-app-name.netlify.app,http://localhost:3000,http://localhost:5500
```

4. Save changes (auto-redeploys)

---

## Step 3: Verify Deployment

### 3.1 Test Backend

Open browser and visit:
```
https://netflix-movie-api-xxxxx.onrender.com/
```

You should see:
```json
{
  "status": "ok",
  "message": "Netflix Movie API Server is running"
}
```

### 3.2 Test Frontend

Visit your Netlify URL and verify:
- Movies load correctly
- Login/Signup pages work
- No "Unable to connect" errors

---

## Troubleshooting

### "Unable to connect to server" Error

1. **Check Backend URL**: Make sure `BACKEND_URL` in `client/js/api.js` matches your Render URL
2. **Check CORS**: Verify `ALLOWED_ORIGINS` in Render includes your Netlify URL
3. **Check Server Status**: Visit your Render URL directly to see if it's running
4. **Wake Up Server**: Render free tier sleeps after 15min. First request takes 30-60s

### CORS Errors

In browser console, if you see:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

Solution:
1. Go to Render Dashboard
2. Add your exact Netlify URL to `ALLOWED_ORIGINS`
3. Include `https://` prefix
4. Redeploy

### Database Connection Errors

1. Verify Aiven MySQL is running
2. Check all DB_* environment variables in Render
3. Ensure your IP is allowed in Aiven security settings

### API Key Errors

1. Verify `OMDB_API_KEY` is set in Render environment
2. Test API key at: `http://www.omdbapi.com/?apikey=YOUR_KEY&t=Inception`

---

## Custom Domain (Optional)

### Backend (Render)
1. Go to Render Dashboard → Your Service → Settings
2. Add Custom Domain
3. Follow DNS instructions

### Frontend (Netlify)
1. Go to Netlify Dashboard → Your Site → Domain Settings
2. Add Custom Domain
3. Configure DNS

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this) | `10000` |
| `DB_HOST` | MySQL host | `mysql-xxxxx.aivencloud.com` |
| `DB_USER` | MySQL username | `avnadmin` |
| `DB_PASSWORD` | MySQL password | `your-password` |
| `DB_NAME` | Database name | `defaultdb` |
| `DB_PORT` | MySQL port | `14067` |
| `OMDB_API_KEY` | OMDb API key | `9464f577` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://app.netlify.app` |

---

## Support

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **OMDb API**: http://www.omdbapi.com
