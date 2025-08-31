# Netlify Deployment Guide

Your application is now ready for Netlify deployment! Here's how to deploy it:

## Quick Deployment Steps

1. **Push your code to GitHub/GitLab** (if not already done)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/log in
   - Click "New site from Git"
   - Connect your repository

3. **Configure build settings:**
   - Build command: `./build-netlify.sh`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

4. **Set environment variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add your MongoDB URI and email credentials:
     ```
     MONGODB_URI=your_mongodb_connection_string
     SENDGRID_API_KEY=your_sendgrid_key (optional)
     SENDGRID_FROM_EMAIL=your_email@domain.com (optional)
     ```

## What's Been Configured

✅ **Frontend**: React app builds to `dist/public`
✅ **Backend**: Express routes converted to Netlify Functions
✅ **Database**: MongoDB integration ready
✅ **Email**: SendGrid/SMTP email notifications
✅ **Routing**: All API calls redirect to serverless functions
✅ **CORS**: Properly configured for cross-origin requests

## Available Endpoints

Your Netlify functions will be available at:
- `/.netlify/functions/service` - Guest lookup by room number
- `/.netlify/functions/inquiry` - Submit guest inquiries  
- `/.netlify/functions/request-service` - Service requests
- `/.netlify/functions/service-requests` - Get all service requests
- `/.netlify/functions/add-test-guest` - Add test guest data

## Environment Variables Needed

Copy from `.env.example` and set in Netlify dashboard:
- `MONGODB_URI` - Your MongoDB connection string
- `SENDGRID_API_KEY` - For email notifications (optional)
- `SENDGRID_FROM_EMAIL` - Sender email address (optional)

## Testing Locally with Netlify CLI

```bash
npm install -g netlify-cli
netlify dev
```

Your app will run with Netlify Functions locally for testing.

## Database Setup

Make sure your MongoDB database is accessible from Netlify's servers:
- Use MongoDB Atlas (recommended)
- Or ensure your MongoDB server accepts connections from external IPs
- Update MONGODB_URI environment variable accordingly