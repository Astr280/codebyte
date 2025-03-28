// CodeByte - AI Programming Assistant
// Powered by Google's Gemini API

document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const DARK_THEME_STORAGE = 'dark_theme';
    const HISTORY_STORAGE = 'chat_history';
    
    // Hardcoded API key - Replace this with your actual API key
    const API_KEY = "AIzaSyAdqM_Ar_tR2udhWBF251yXsxrUfewzzPw";
    // Hugging Face free API token - Replace with your token from https://huggingface.co/settings/tokens
    const HF_API_TOKEN = "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";
    
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const themeToggle = document.querySelector('.theme-toggle');
    const copyCodeButton = document.getElementById('copy-code');
    const closePreviewButton = document.getElementById('close-preview');
    const codePreview = document.getElementById('code-preview');
    const codeContent = document.getElementById('code-content');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const clearChatButton = document.getElementById('clear-chat');
    const clearChatMobileButton = document.getElementById('clear-chat-mobile');
    const chatbotButton = document.getElementById('chatbot-button');
    
    // Media generation elements
    const mediaButton = document.getElementById('media-button');
    const mediaModal = document.getElementById('media-modal');
    const closeMediaModal = document.getElementById('close-media-modal');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const generateImageBtn = document.getElementById('generate-image-btn');
    const generateVideoBtn = document.getElementById('generate-video-btn');
    const imagePrompt = document.getElementById('image-prompt');
    const imageStyle = document.getElementById('image-style');
    
    // State
    let isWaitingForResponse = false;
    let chatHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]');
    let isGeneratingImage = false;
    
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ["#ff3e78", "#7000ff", "#00e8ff"]
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    },
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#7000ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize theme
    if (localStorage.getItem(DARK_THEME_STORAGE) === 'true') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Load chat history if exists
    loadChatHistory();
    
    // Event Listeners
    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Handle suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent;
            userInput.style.height = 'auto';
            userInput.style.height = userInput.scrollHeight + 'px';
            sendMessage();
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Clear chat - both desktop and mobile versions
    clearChatButton.addEventListener('click', clearChat);
    clearChatMobileButton.addEventListener('click', clearChat);
    
    // Code preview actions
    copyCodeButton.addEventListener('click', copyCodeToClipboard);
    closePreviewButton.addEventListener('click', () => {
        codePreview.classList.remove('active');
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
    
    // Media generation modal event listeners
    mediaButton.addEventListener('click', () => {
        mediaModal.style.display = 'flex';
    });
    
    closeMediaModal.addEventListener('click', () => {
        mediaModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === mediaModal) {
            mediaModal.style.display = 'none';
        }
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button and corresponding pane
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Generate image
    generateImageBtn.addEventListener('click', generateAIImage);
    
    // Generate video (mock functionality)
    generateVideoBtn.addEventListener('click', () => {
        alert('Video generation is currently under development.');
    });
    
    // Chatbot button event listener
    chatbotButton.addEventListener('click', async () => {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToChat('user', userMessage);
        userInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch('https://api.gemini.com/v1/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    question: userMessage
                })
            });

            const data = await response.json();
            removeTypingIndicator();

            if (response.ok) {
                addMessageToChat('bot', data.answer);
            } else {
                addMessageToChat('bot', 'Sorry, I couldn\'t process your request.');
            }
        } catch (error) {
            removeTypingIndicator();
            addMessageToChat('bot', 'Error connecting to the Gemini API.');
        }
    });
    
    // Functions
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        if (isDarkTheme) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        localStorage.setItem(DARK_THEME_STORAGE, isDarkTheme);
    }

    function clearChat() {
        // Show confirmation dialog
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Clear the chat display
            chatMessages.innerHTML = '';
            
            // Add the initial welcome message
            addMessageToChat('bot', 'Hello! I\'m CodeByte, your programming assistant with visual generation capabilities. Ask me any programming question or request an AI-generated image or video to help explain concepts! 👨‍💻');
            
            // Clear the chat history
            chatHistory = [];
            localStorage.removeItem(HISTORY_STORAGE);
        }
    }
    
    // Function to generate mock responses when API fails
    function getMockResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            return "Hello! I'm CodeByte, your programming assistant. How can I help you with coding today?";
        }
        
        if (lowerQuery.includes('javascript') || lowerQuery.includes('js')) {
            return "JavaScript is a versatile programming language primarily used for web development. Here's a simple example:\n\n```javascript\n// Define a function to greet a user\nfunction greetUser(name) {\n  return `Hello, ${name}! Welcome to JavaScript.`;\n}\n\n// Call the function\nconst message = greetUser('Developer');\nconsole.log(message); // Output: Hello, Developer! Welcome to JavaScript.\n```\n\nJavaScript can be used for:\n- Frontend web development\n- Backend development with Node.js\n- Mobile app development\n- Game development\n\nPopular JavaScript frameworks include React, Angular, and Vue.";
        }
        
        if (lowerQuery.includes('python')) {
            return "Python is a high-level, interpreted programming language known for its readability and simplicity. Here's an example:\n\n```python\n# Define a function to calculate factorial\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n\n# Calculate factorial of 5\nresult = factorial(5)\nprint(f\"The factorial of 5 is {result}\")  # Output: The factorial of 5 is 120\n```\n\nPython is widely used in:\n- Data Science and Machine Learning\n- Web Development (with Django or Flask)\n- Automation and Scripting\n- Scientific Computing";
        }
        
        if (lowerQuery.includes('css')) {
            return "CSS (Cascading Style Sheets) is used to style HTML documents. Here's a basic example:\n\n```css\n/* Styling a button with hover effects */\n.button {\n  background-color: #7000ff;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  transition: all 0.3s ease;\n}\n\n.button:hover {\n  background-color: #ff3e78;\n  transform: translateY(-2px);\n  box-shadow: 0 5px 15px rgba(255, 62, 120, 0.4);\n}\n```\n\nCSS can be used for:\n- Layout and positioning\n- Animations and transitions\n- Responsive design\n- Theming and customization";
        }
        
        if (lowerQuery.includes('html')) {
            return "HTML (HyperText Markup Language) is the standard markup language for creating web pages. Here's a basic example:\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>My Web Page</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <header>\n    <h1>Welcome to My Website</h1>\n    <nav>\n      <ul>\n        <li><a href=\"#home\">Home</a></li>\n        <li><a href=\"#about\">About</a></li>\n        <li><a href=\"#contact\">Contact</a></li>\n      </ul>\n    </nav>\n  </header>\n  <main>\n    <p>This is my first web page!</p>\n  </main>\n  <script src=\"script.js\"></script>\n</body>\n</html>\n```";
        }
        
        if (lowerQuery.includes('react')) {
            return "React is a JavaScript library for building user interfaces. Here's a simple component example:\n\n```jsx\nimport React, { useState } from 'react';\n\nfunction Counter() {\n  // State to track count\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className=\"counter\">\n      <h2>Counter: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n    </div>\n  );\n}\n\nexport default Counter;\n```\n\nReact features include:\n- Component-based architecture\n- Virtual DOM for efficient rendering\n- Unidirectional data flow\n- Rich ecosystem of libraries and tools";
        }
        
        if (lowerQuery.includes('explain')) {
            return "I'd be happy to explain programming concepts! To give you a proper explanation, could you specify which programming concept, language, or technology you'd like me to explain? For example: variables, loops, functions, object-oriented programming, etc.";
        }
        
        if (lowerQuery.includes('image') || lowerQuery.includes('picture') || lowerQuery.includes('diagram')) {
            return "I can generate images to help explain programming concepts! Click the media button (photo/video icon) next to the chat input, or you can directly type 'Generate an image of [your programming concept]' and I'll create a visualization for you.";
        }
        
        // Default response
        return "I'm here to help with programming questions and generate explanatory images. What programming topic can I assist you with today?";
    }
    
    function sendMessage() {
        const userMessage = userInput.value.trim();
        
        if (!userMessage || isWaitingForResponse) return;
        
        // Add user message to chat
        addMessageToChat('user', userMessage);
        
        // Clear input field and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Add to chat history
        chatHistory.push({ role: 'user', content: userMessage });
        saveChatHistory();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Check if it's an image generation request
        if (userMessage.toLowerCase().includes('generate an image') || 
            userMessage.toLowerCase().includes('create an image') ||
            userMessage.toLowerCase().includes('make an image')) {
            
            handleImageGenerationRequest(userMessage);
        } else {
            // Handle regular chat
            processRegularChat(userMessage);
        }
    }
    
    function processRegularChat(userMessage) {
        // Call Gemini API or get mock response
        isWaitingForResponse = true;
        
        // Using a timeout to simulate API call delay and show typing indicator
        setTimeout(() => {
            try {
                // Use mock response directly - this bypasses the API completely
                const response = getMockResponse(userMessage);
                
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add AI response to chat
                addMessageToChat('bot', response);
                
                // Add to chat history
                chatHistory.push({ role: 'bot', content: response });
                saveChatHistory();
                
                // Extract and highlight code blocks
                highlightCodeBlocks();
            } catch (error) {
                console.error('Error generating response:', error);
                removeTypingIndicator();
                addMessageToChat('bot', 'Sorry, I encountered an error. Please try again with a different question.');
            } finally {
                isWaitingForResponse = false;
            }
        }, 1000); // Simulate a 1-second delay
    }
    
    function handleImageGenerationRequest(userMessage) {
        // Extract image prompt - basic extraction, can be enhanced
        let prompt = userMessage.replace(/generate an image|create an image|make an image/i, '').trim();
        if (prompt.startsWith('of') || prompt.startsWith('for')) {
            prompt = prompt.substring(2).trim();
        }
        
        // Default to diagram style for code explanations
        generateAIImageWithPrompt(prompt, 'diagram');
    }
    
    function addMessageToChat(role, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', role);
        
        // Format the current time
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        // Create message HTML structure
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${formatMessage(message)}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        // Add message to chat
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    // Function to add an AI-generated image to the chat
    function addImageToChat(imageUrl, prompt) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        // Create caption and image container
        const caption = document.createElement('p');
        caption.textContent = `Generated image for: "${prompt}"`;
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'generated-image-container';
        
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = prompt;
        image.className = 'generated-image';
        image.loading = 'lazy';
        
        // Add error handling for image loading
        image.onerror = function() {
            image.src = 'https://i.imgur.com/mTpKUvQ.png'; // Fallback image
            caption.textContent = `Could not load image for: "${prompt}". Using fallback image.`;
        };
        
        imageContainer.appendChild(image);
        bubbleDiv.appendChild(caption);
        bubbleDiv.appendChild(imageContainer);
        
        // Format the current time
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = timeString;
        
        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeDiv);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Add to chat history
        chatHistory.push({ 
            role: 'bot', 
            content: `![${prompt}](${imageUrl})`,
            type: 'image'
        });
        saveChatHistory();
        
        scrollToBottom();
    }
    
    function formatMessage(message) {
        // Use marked library to convert markdown to HTML if available
        if (typeof marked !== 'undefined') {
            return marked.parse(message);
        }
        
        // Basic formatting if marked is not available
        return message
            .replace(/\n/g, '<br>')
            .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code class="$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    
    function highlightCodeBlocks() {
        // If highlight.js is available, apply it to code blocks
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
                
                // Add copy button to code blocks
                if (!block.parentElement.querySelector('.code-btn-container')) {
                    const container = document.createElement('div');
                    container.className = 'code-btn-container';
                    
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'code-btn copy-btn';
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.title = 'Copy code';
                    
                    const expandBtn = document.createElement('button');
                    expandBtn.className = 'code-btn expand-btn';
                    expandBtn.innerHTML = '<i class="fas fa-expand-alt"></i>';
                    expandBtn.title = 'Expand code';
                    
                    container.appendChild(copyBtn);
                    container.appendChild(expandBtn);
                    
                    block.parentElement.insertBefore(container, block);
                    
                    // Add event listeners
                    copyBtn.addEventListener('click', function() {
                        const codeText = block.textContent;
                        navigator.clipboard.writeText(codeText)
                            .then(() => {
                                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                                setTimeout(() => {
                                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                                }, 2000);
                            })
                            .catch(err => {
                                console.error('Could not copy text: ', err);
                            });
                    });
                    
                    expandBtn.addEventListener('click', function() {
                        // Show code in a modal
                        codeContent.textContent = block.textContent;
                        codeContent.className = block.className;
                        codePreview.classList.add('active');
                        hljs.highlightElement(codeContent);
                    });
                }
            });
        }
    }
    
    function copyCodeToClipboard() {
        const code = codeContent.textContent;
        navigator.clipboard.writeText(code)
            .then(() => {
                copyCodeButton.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyCodeButton.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }
    
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingIndicator);
        scrollToBottom();
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function saveChatHistory() {
        // Limit history to last 50 messages to avoid localStorage limitations
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(chatHistory.length - 50);
        }
        localStorage.setItem(HISTORY_STORAGE, JSON.stringify(chatHistory));
    }
    
    function loadChatHistory() {
        const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE) || '[]');
        
        if (history.length > 0) {
            chatMessages.innerHTML = ''; // Clear default message
            
            history.forEach(entry => {
                if (entry.type === 'image') {
                    // Extract image URL and prompt from markdown format
                    const match = entry.content.match(/!\[(.*?)\]\((.*?)\)/);
                    if (match && match.length >= 3) {
                        const prompt = match[1];
                        const imageUrl = match[2];
                        addImageToChat(imageUrl, prompt);
                    } else {
                        addMessageToChat(entry.role, entry.content);
                    }
                } else {
                    addMessageToChat(entry.role, entry.content);
                }
            });
            
            // Highlight code blocks after loading chat history
            highlightCodeBlocks();
        }
        
        chatHistory = history;
    }
    
    // Function to generate AI image using Hugging Face API
    async function generateAIImage() {
        if (isGeneratingImage) return;
        
        const prompt = imagePrompt.value.trim();
        if (!prompt) {
            alert('Please enter a prompt for the image.');
            return;
        }
        
        // Get selected style
        const style = imageStyle.value;
        
        // Close the modal
        mediaModal.style.display = 'none';
        
        // Add user prompt to chat
        const userPrompt = `Generate an image: ${prompt}`;
        addMessageToChat('user', userPrompt);
        
        // Generate the image
        generateAIImageWithPrompt(prompt, style);
    }
    
    // Separate function to handle image generation
    async function generateAIImageWithPrompt(prompt, style) {
        if (isGeneratingImage) return;
        
        let fullPrompt = prompt;
        
        // Add style-specific modifiers to the prompt
        switch(style) {
            case 'cartoon':
                fullPrompt += ', cartoon style, vibrant colors, simple shapes';
                break;
            case 'sketch':
                fullPrompt += ', sketch, black and white, pencil drawing';
                break;
            case 'diagram':
                fullPrompt += ', technical diagram, clear labels, programming concept visualization';
                break;
            case 'realistic':
            default:
                fullPrompt += ', detailed, realistic, high resolution';
                break;
        }
        
        // Add programming context to ensure it's relevant to coding
        fullPrompt += ', programming, coding, software development, computer science education';
        
        try {
            isGeneratingImage = true;
            
            // Show typing indicator before adding the image
            showTypingIndicator();
            
            // Use Hugging Face's Stable Diffusion API
            const imageUrl = await fetchHuggingFaceImage(fullPrompt);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add the generated image to chat
            addImageToChat(imageUrl, prompt);
            
            // Reset form
            if (imagePrompt) {
                imagePrompt.value = '';
            }
            
        } catch (error) {
            console.error('Error generating image:', error);
            removeTypingIndicator();
            addMessageToChat('bot', 'Sorry, I encountered an error generating the image. Please try again with a different prompt.');
        } finally {
            isGeneratingImage = false;
            if (generateImageBtn) {
                generateImageBtn.textContent = 'Generate Image';
                generateImageBtn.disabled = false;
            }
        }
    }
    
    // Function to call Hugging Face API for image generation
    async function fetchHuggingFaceImage(prompt) {
        try {
            // First, try the Stable Diffusion API on Hugging Face
            const response = await fetch(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HF_API_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ inputs: prompt }),
                }
            );
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const blob = await response.blob();
            return URL.createObjectURL(blob);
            
            
            // For demo purposes, return a random image from our examples
            // In production, use the actual API call above
            return demoImages[Math.floor(Math.random() * demoImages.length)];
            
        } catch (error) {
            console.error("Error calling Hugging Face API:", error);
            
            // Fallback to a placeholder image if API call fails
            const demoImages = [
                'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/sd_example.png',
                'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/landscape.png',
                'https://i.imgur.com/4y3L4vU.png',
                'https://i.imgur.com/ITAASAq.jpg',
                'https://i.imgur.com/mTpKUvQ.png'
            ];
            
            return demoImages[Math.floor(Math.random() * demoImages.length)];
        }
    }
    
    // CSS for code block buttons (adding dynamically since they're generated)
    const style = document.createElement('style');
    style.textContent = `
        .code-btn-container {
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            gap: 5px;
        }
        
        .code-btn, .code-view-btn {
            background: rgba(0, 0, 0, 0.3);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.2s ease;
        }
        
        .code-btn:hover, .code-view-btn:hover {
            background: rgba(0, 0, 0, 0.5);
        }
        
        .typing-dots {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-color);
            display: inline-block;
            animation: typing-dot 1.5s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing-dot {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
});
