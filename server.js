const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = {
    API_KEY: "AIzaSyAp7-Ppj7TvpETTwPoevcUcIdb9tgouZYY",
    API_TEXT_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent",
    API_IMAGE_URL: "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict"
};

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.use(express.static(__dirname));

// API Routes
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, options = {} } = req.body;
        
        if (!prompt || prompt.trim().length < 10) {
            return res.status(400).json({ 
                error: 'Please provide a detailed prompt (minimum 10 characters)' 
            });
        }

        console.log('Generating image with prompt:', prompt);
        console.log('Options:', options);

        // First, enhance the prompt using Gemini
        const enhancedPrompt = await enhancePrompt(prompt, options);
        
        // Then generate the image using Imagen
        const images = await generateImageWithImagen(enhancedPrompt, options);
        
        res.json({ 
            success: true, 
            images: images,
            enhancedPrompt: enhancedPrompt
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to generate image' 
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'AI Image Generator API'
    });
});

// Image Generation Functions
async function enhancePrompt(prompt, options) {
    try {
        const enhancementPrompt = `
You are an expert image prompt engineer. Enhance the following prompt for AI image generation.

Original prompt: "${prompt}"

Style: ${options.style || 'photorealistic'}
Size: ${options.size || '1024x1024'}

Please enhance this prompt by:
1. Adding specific details about lighting, composition, and atmosphere
2. Including technical quality specifications (8k, ultra-realistic, etc.)
3. Adding relevant artistic elements that match the style
4. Making it more descriptive and detailed

Return ONLY the enhanced prompt, no explanations or additional text.
`;

        const response = await fetch(`${CONFIG.API_TEXT_URL}?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: enhancementPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to enhance prompt');
        }

        const data = await response.json();
        const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
        
        console.log('Enhanced prompt:', enhancedPrompt);
        return enhancedPrompt.trim();
    } catch (error) {
        console.warn('Prompt enhancement failed, using original prompt:', error.message);
        return prompt;
    }
}

async function generateImageWithImagen(prompt, options) {
    const requestBody = {
        instances: [{
            prompt: prompt,
            ...(options.negativePrompt && { negativePrompt: options.negativePrompt }),
            ...(options.seed && { seed: parseInt(options.seed) }),
            ...(options.guidance && { guidanceScale: parseFloat(options.guidance) }),
            aspectRatio: options.aspectRatio || '1:1',
            sampleCount: parseInt(options.numImages) || 1,
            sampleImageSize: options.size || '1024x1024'
        }]
    };

    console.log('Imagen request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${CONFIG.API_IMAGE_URL}?key=${CONFIG.API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Imagen API error:', errorData);
        throw new Error(errorData.error?.message || `Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Imagen response:', data);
    
    // Process the response and extract image data
    const images = [];
    if (data.predictions) {
        data.predictions.forEach((prediction, index) => {
            if (prediction.bytesBase64Encoded) {
                images.push({
                    id: `img_${Date.now()}_${index}`,
                    prompt: prompt,
                    imageData: prediction.bytesBase64Encoded,
                    timestamp: new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    options: options
                });
            }
        });
    }

    if (images.length === 0) {
        throw new Error('No images were generated');
    }

    return images;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`AI Image Generator server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});

module.exports = app;