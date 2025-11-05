# AI Image Generator - Vertex AI Studio

A professional web application for generating AI images using Google's Vertex AI (Imagen 3.0 and Gemini 2.5 Flash). Built with modern web technologies and deployed on Netlify.

## Features

- **Advanced Image Generation**: Powered by Google's Imagen 3.0 and Gemini 2.5 Flash
- **Professional UI**: Modern, responsive design with dark theme
- **Enhanced Prompts**: Automatic prompt enhancement using Gemini AI
- **Multiple Options**: Various sizes, aspect ratios, styles, and advanced settings
- **Batch Generation**: Generate multiple images at once
- **Download & Management**: Easy download and regeneration of images
- **Real-time Feedback**: Progress indicators and success notifications

## Technology Stack

- **Frontend**: HTML5, CSS3 (Tailwind-inspired), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI APIs**: 
  - Google Gemini 2.5 Flash (prompt enhancement)
  - Google Imagen 3.0 (image generation)
- **Deployment**: Netlify
- **Styling**: Custom CSS with CSS Grid and Flexbox

## File Structure

```
/
├── index.html          # Main application interface
├── styles.css          # Professional styling
├── script.js           # Frontend JavaScript logic
├── server.js           # Node.js backend server
├── package.json        # Node.js dependencies
├── netlify.toml        # Netlify deployment configuration
└── README.md           # This file
```

## Setup & Installation

### Local Development

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Or directly with Node.js:
   ```bash
   node server.js
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Deployment on Netlify

1. **Prepare your files**:
   - Ensure all files are in a single directory
   - Verify `package.json` and `netlify.toml` are present

2. **Deploy to Netlify**:
   - Method 1: Drag and drop the folder to Netlify
   - Method 2: Connect to Git repository
   - Method 3: Use Netlify CLI

3. **Environment Variables** (if needed):
   - `NODE_VERSION`: 18 (already set in netlify.toml)

## Usage

1. **Enter a Prompt**: Describe the image you want to create
2. **Select Options**: Choose size, aspect ratio, style, and other settings
3. **Advanced Options**: Access negative prompts, seed values, and guidance scale
4. **Generate**: Click the generate button and wait 10-30 seconds
5. **Download**: Save your generated images or regenerate variations

### Example Prompts

- "A serene mountain landscape at sunset with dramatic clouds, ultra-realistic, 8k quality"
- "A futuristic cyberpunk city with neon lights and flying cars, digital art style"
- "A mystical forest with glowing mushrooms and ancient trees, fantasy art"

## API Configuration

The application uses Google's Vertex AI APIs:

- **Gemini 2.5 Flash**: For prompt enhancement and text processing
- **Imagen 3.0**: For actual image generation

API Key is configured in the code and should be secured in production environments.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Features

- **Lazy Loading**: Images are loaded efficiently
- **Responsive Design**: Works on desktop and mobile devices
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Optimized Assets**: Minified CSS and efficient image handling

## Security Features

- Content Security Policy (CSP) headers
- XSS protection
- Frame options protection
- Input validation and sanitization

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, and layout
- CSS custom properties are used for easy theme customization

### Functionality
- Update `script.js` to add new features or modify behavior
- Extend `server.js` for additional backend functionality

## Troubleshooting

### Common Issues

1. **Images not generating**:
   - Check API key validity
   - Verify internet connection
   - Check browser console for errors

2. **Slow generation**:
   - AI image generation typically takes 10-30 seconds
   - Complex prompts may take longer

3. **Deployment issues**:
   - Ensure all files are included
   - Check Netlify build logs
   - Verify Node.js version compatibility

### Support

For issues and feature requests, please check the application logs or contact support.

## License

MIT License - Feel free to use and modify for your projects.

## Acknowledgments

- Google Vertex AI for the powerful image generation APIs
- Font Awesome for icons
- Google Fonts for typography
- Netlify for hosting platform
