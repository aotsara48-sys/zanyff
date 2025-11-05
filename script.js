// Configuration
const CONFIG = {
    API_KEY: "AIzaSyAp7-Ppj7TvpETTwPoevcUcIdb9tgouZYY",
    API_TEXT_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent",
    API_IMAGE_URL: "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict",
    PROJECT_ID: "braided-horizon-477210-s4"
};

// Global state
let isGenerating = false;
let generatedImages = [];

// DOM Elements
const elements = {
    prompt: document.getElementById('prompt'),
    size: document.getElementById('size'),
    aspectRatio: document.getElementById('aspectRatio'),
    style: document.getElementById('style'),
    negativePrompt: document.getElementById('negativePrompt'),
    seed: document.getElementById('seed'),
    guidance: document.getElementById('guidance'),
    guidanceValue: document.querySelector('.range-value'),
    numImages: document.getElementById('numImages'),
    advancedToggle: document.getElementById('advancedToggle'),
    advancedContent: document.getElementById('advancedContent'),
    generateBtn: document.getElementById('generateBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    resultsGrid: document.getElementById('resultsGrid'),
    emptyState: document.getElementById('emptyState'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    toast: document.getElementById('toast')
};

// Utility Functions
const utils = {
    showToast: (message, type = 'success') => {
        const toast = elements.toast;
        const icon = toast.querySelector('i');
        const messageEl = toast.querySelector('.toast-message');
        
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        
        // Update icon based on type
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    formatTimestamp: () => {
        return new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    generateId: () => {
        return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    downloadImage: (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    validatePrompt: (prompt) => {
        if (!prompt || prompt.trim().length < 10) {
            throw new Error('Please enter a more detailed prompt (minimum 10 characters)');
        }
        return prompt.trim();
    }
};

// API Functions
const api = {
    async generateImage(prompt, options = {}) {
        try {
            // First, enhance the prompt using Gemini
            const enhancedPrompt = await this.enhancePrompt(prompt, options);
            
            // Then generate the image using Imagen
            return await this.callImagenAPI(enhancedPrompt, options);
        } catch (error) {
            console.error('Generation error:', error);
            throw new Error('Failed to generate image. Please try again.');
        }
    },

    async enhancePrompt(prompt, options) {
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

        try {
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
            
            return enhancedPrompt.trim();
        } catch (error) {
            console.warn('Prompt enhancement failed, using original prompt');
            return prompt;
        }
    },

    async callImagenAPI(prompt, options) {
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

        const response = await fetch(`${CONFIG.API_IMAGE_URL}?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Image generation failed');
        }

        const data = await response.json();
        
        // Process the response and extract image data
        const images = [];
        if (data.predictions) {
            data.predictions.forEach((prediction, index) => {
                if (prediction.bytesBase64Encoded) {
                    images.push({
                        id: utils.generateId(),
                        prompt: prompt,
                        imageData: prediction.bytesBase64Encoded,
                        timestamp: utils.formatTimestamp(),
                        options: options
                    });
                }
            });
        }

        return images;
    }
};

// UI Functions
const ui = {
    init() {
        this.bindEvents();
        this.updateGuidanceValue();
    },

    bindEvents() {
        // Advanced options toggle
        elements.advancedToggle.addEventListener('click', () => {
            elements.advancedToggle.classList.toggle('active');
            elements.advancedContent.classList.toggle('active');
        });

        // Guidance range slider
        elements.guidance.addEventListener('input', () => {
            this.updateGuidanceValue();
        });

        // Generate button
        elements.generateBtn.addEventListener('click', () => {
            this.handleGenerate();
        });

        // Clear results
        elements.clearResultsBtn.addEventListener('click', () => {
            this.clearResults();
        });

        // Download all
        elements.downloadAllBtn.addEventListener('click', () => {
            this.downloadAllImages();
        });

        // Enter key in prompt textarea
        elements.prompt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.handleGenerate();
            }
        });
    },

    updateGuidanceValue() {
        elements.guidanceValue.textContent = elements.guidance.value;
    },

    async handleGenerate() {
        if (isGenerating) return;

        try {
            // Validate prompt
            const prompt = utils.validatePrompt(elements.prompt.value);
            
            // Collect options
            const options = {
                size: elements.size.value,
                aspectRatio: elements.aspectRatio.value,
                style: elements.style.value,
                negativePrompt: elements.negativePrompt.value,
                seed: elements.seed.value,
                guidance: elements.guidance.value,
                numImages: elements.numImages.value
            };

            // Update UI state
            this.setGeneratingState(true);
            
            // Generate images
            const images = await api.generateImage(prompt, options);
            
            if (images.length > 0) {
                // Add to results
                generatedImages.push(...images);
                this.displayResults();
                
                // Show success message
                utils.showToast(`Generated ${images.length} image${images.length > 1 ? 's' : ''} successfully!`);
                
                // Clear the prompt for next generation
                elements.prompt.value = '';
            } else {
                throw new Error('No images were generated');
            }

        } catch (error) {
            console.error('Generation error:', error);
            utils.showToast(error.message || 'Failed to generate images', 'error');
        } finally {
            this.setGeneratingState(false);
        }
    },

    setGeneratingState(generating) {
        isGenerating = generating;
        
        if (generating) {
            elements.generateBtn.classList.add('loading');
            elements.generateBtn.disabled = true;
            elements.generateBtn.querySelector('.btn-text').textContent = 'Generating...';
        } else {
            elements.generateBtn.classList.remove('loading');
            elements.generateBtn.disabled = false;
            elements.generateBtn.querySelector('.btn-text').textContent = 'Generate Image';
        }
    },

    displayResults() {
        if (generatedImages.length === 0) {
            elements.emptyState.style.display = 'block';
            elements.resultsGrid.classList.remove('has-images');
            elements.downloadAllBtn.disabled = true;
            return;
        }

        elements.emptyState.style.display = 'none';
        elements.resultsGrid.classList.add('has-images');
        elements.downloadAllBtn.disabled = false;

        // Clear existing results
        const existingResults = elements.resultsGrid.querySelectorAll('.image-result');
        existingResults.forEach(el => el.remove());

        // Add all images
        generatedImages.forEach(image => {
            const resultElement = this.createResultElement(image);
            elements.resultsGrid.appendChild(resultElement);
        });
    },

    createResultElement(image) {
        const div = document.createElement('div');
        div.className = 'image-result';
        div.innerHTML = `
            <img src="data:image/png;base64,${image.imageData}" alt="Generated image" />
            <div class="result-info">
                <div class="result-meta">
                    <small class="timestamp">${image.timestamp}</small>
                    <small class="style">${image.options.style || 'Default'}</small>
                </div>
                <p class="prompt-text" title="${image.prompt}">${image.prompt.substring(0, 100)}${image.prompt.length > 100 ? '...' : ''}</p>
                <div class="result-actions">
                    <button class="action-btn download-btn" onclick="ui.downloadImage('${image.id}')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                    <button class="action-btn regenerate-btn" onclick="ui.regenerateImage('${image.id}')">
                        <i class="fas fa-redo"></i>
                        Regenerate
                    </button>
                </div>
            </div>
        `;

        // Add some styling for the result info
        const style = document.createElement('style');
        style.textContent = `
            .result-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            .timestamp {
                color: var(--text-muted);
            }
            .style {
                background: var(--primary-color);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: var(--radius-sm);
                font-size: 0.75rem;
            }
            .prompt-text {
                font-size: 0.875rem;
                line-height: 1.4;
                margin-bottom: 0.75rem;
                color: var(--text-secondary);
            }
        `;
        div.appendChild(style);

        return div;
    },

    downloadImage(imageId) {
        const image = generatedImages.find(img => img.id === imageId);
        if (image) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${image.imageData}`;
            link.download = `ai-image-${image.timestamp.replace(/[^a-z0-9]/gi, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            utils.showToast('Image downloaded successfully!');
        }
    },

    async regenerateImage(imageId) {
        const originalImage = generatedImages.find(img => img.id === imageId);
        if (originalImage) {
            // Set the prompt and options
            elements.prompt.value = originalImage.prompt;
            elements.style.value = originalImage.options.style || 'photorealistic';
            elements.size.value = originalImage.options.size || '1024x1024';
            elements.aspectRatio.value = originalImage.options.aspectRatio || '1:1';
            elements.negativePrompt.value = originalImage.options.negativePrompt || '';
            elements.seed.value = '';
            elements.guidance.value = originalImage.options.guidance || '7';
            this.updateGuidanceValue();
            
            // Scroll to top
            elements.prompt.scrollIntoView({ behavior: 'smooth' });
            elements.prompt.focus();
            
            utils.showToast('Prompt loaded. Click Generate to create a new variation!');
        }
    },

    downloadAllImages() {
        if (generatedImages.length === 0) return;
        
        generatedImages.forEach((image, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = `data:image/png;base64,${image.imageData}`;
                link.download = `ai-image-${index + 1}-${image.timestamp.replace(/[^a-z0-9]/gi, '-')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 200); // Stagger downloads to avoid rate limiting
        });
        
        utils.showToast(`Downloading ${generatedImages.length} image${generatedImages.length > 1 ? 's' : ''}...`);
    },

    clearResults() {
        if (generatedImages.length === 0) return;
        
        if (confirm('Are you sure you want to clear all generated images?')) {
            generatedImages = [];
            this.displayResults();
            utils.showToast('All images cleared');
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    ui.init();
    
    // Add some sample prompts for inspiration
    const samplePrompts = [
        "A mystical forest with ancient trees and glowing mushrooms, ethereal lighting, fantasy art style",
        "A futuristic city skyline at night with flying cars and neon lights, cyberpunk aesthetic",
        "A serene beach sunset with dramatic clouds and reflections, photorealistic, 8k quality",
        "A majestic dragon perched on a mountain peak, epic fantasy art, detailed scales",
        "A cozy coffee shop interior with warm lighting and people working on laptops",
        "An abstract geometric pattern with vibrant colors and flowing shapes"
    ];
    
    // Randomly set a sample prompt placeholder
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    elements.prompt.placeholder = randomPrompt;
});

// Handle page visibility change to pause/resume any ongoing processes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isGenerating) {
        console.log('Page hidden while generating - process may continue in background');
    }
});

// Handle beforeunload to warn about ongoing generation
window.addEventListener('beforeunload', (e) => {
    if (isGenerating) {
        e.preventDefault();
        e.returnValue = 'Image generation is in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ui, api, utils, CONFIG };
}