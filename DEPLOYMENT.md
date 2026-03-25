# Vercel Deployment Guide - InstaNyaw

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://www.mongodb.com/atlas)

## Deployment Steps

### Step 1: Prepare MongoDB Database

1. Create a free MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for Vercel serverless functions
4. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/LaConslaNet`)

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended for first deployment)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `https://github.com/cedmanucdocae/laconslanet`
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty or use `npm run vercel-build`
   - **Output Directory**: `frontend`

4. Add Environment Variables (click "Environment Variables"):

   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/LaConslaNet
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   FRONTEND_URL=https://your-project-name.vercel.app
   PORT=5000
   NODE_ENV=production
   ```

5. Click "Deploy"

#### Option B: Deploy via CLI

1. Login to Vercel:

   ```bash
   vercel login
   ```

2. Deploy from project root:

   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **instanyaw** (or your preferred name)
   - In which directory is your code located? **./**

4. Add environment variables:

   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add FRONTEND_URL
   vercel env add NODE_ENV
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Environment Variables

After first deployment, update `FRONTEND_URL` to match your Vercel domain:

```bash
vercel env add FRONTEND_URL production
# Enter: https://your-project-name.vercel.app
```

Then redeploy:

```bash
vercel --prod
```

## Environment Variables Reference

| Variable       | Description                                     | Example                                                                                   |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `MONGO_URI`    | MongoDB connection string                       | `mongodb+srv://user:pass@cluster.mongodb.net/LaConslaNet`                                 |
| `JWT_SECRET`   | Secret key for JWT tokens                       | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FRONTEND_URL` | Your Vercel deployment URL                      | `https://your-project-name.vercel.app`                                                    |
| `PORT`         | Server port (Vercel handles this automatically) | `5000`                                                                                    |
| `NODE_ENV`     | Environment mode                                | `production`                                                                              |

## Important Notes

### Socket.IO Limitations on Vercel

⚠️ **WebSockets on Vercel serverless functions have limitations**:

- Vercel serverless functions are stateless and have a maximum execution time
- Socket.IO will automatically fall back to HTTP long-polling if WebSockets are not available
- For real-time features, consider these alternatives:
  1. Use polling mode (Socket.IO handles this automatically)
  2. Deploy backend separately to a platform that supports persistent WebSockets (Railway, Render, Fly.io)
  3. Use Vercel Edge Functions (experimental)

### File Uploads

- Vercel serverless functions have limited filesystem access
- Uploaded files should be stored in a cloud service (AWS S3, Cloudinary, etc.)
- Current setup stores files in `/uploads` which won't persist on Vercel
- **Recommendation**: Integrate a cloud storage solution for production

## Verification

After deployment, verify:

1. **Frontend**: Visit `https://your-project-name.vercel.app`
2. **API Health**: Check `https://your-project-name.vercel.app/api/auth` (should return route info or 404)
3. **Database Connection**: Try logging in/registering to verify MongoDB connection
4. **Socket.IO**: Check browser console for Socket.IO connection status

## Troubleshooting

- **"Cannot connect to database"**: Verify MONGO_URI and IP whitelist in MongoDB Atlas
- **"CORS error"**: Ensure FRONTEND_URL matches your Vercel domain exactly
- **"Socket.IO not connecting"**: Check that Socket.IO is falling back to polling mode
- **"File upload not working"**: Implement cloud storage solution

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` environment variable to your custom domain

## Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your changes will be live in ~1-2 minutes.

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Documentation: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
