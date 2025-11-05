# Deployment Guide

## Quick Deployment to Netlify

### Method 1: Direct Upload (Recommended)
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the entire project folder
3. Netlify will automatically detect and deploy

### Method 2: Git Repository
1. Upload files to GitHub/GitLab
2. Connect repository to Netlify
3. Deploy automatically on push

### Method 3: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

## Current Deployment

🌐 **Live Website**: https://dmi2dx4hjjh5a.ok.kimi.link

## Deployment Files Included

- ✅ `index.html` - Main application
- ✅ `styles.css` - Professional styling
- ✅ `script.js` - Frontend functionality
- ✅ `server.js` - Backend API server
- ✅ `package.json` - Node.js dependencies
- ✅ `netlify.toml` - Netlify configuration
- ✅ `README.md` - Documentation

## Features Available

- 🎨 Professional dark theme UI
- 🖼️ AI Image Generation with Vertex AI
- ⚡ Prompt enhancement with Gemini
- 📱 Responsive design
- 💾 Download generated images
- 🔄 Regenerate variations
- ⚙️ Advanced options (negative prompts, guidance scale, etc.)

## API Integration

The application is configured with your provided API keys:
- **Gemini 2.5 Flash**: For prompt enhancement
- **Imagen 3.0**: For image generation
- **Project ID**: braided-horizon-477210-s4

## Next Steps

1. Visit the deployed website
2. Test image generation with sample prompts
3. Customize styling or functionality as needed
4. Monitor usage and performance

## Support

If you encounter any issues with the deployment or functionality, please check:
- Browser console for errors
- Netlify build logs
- API usage limits
- Network connectivity