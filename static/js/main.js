document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearButton = document.getElementById('clear-chat');
    const retryButton = document.getElementById('retry-last');

    // If elements don't exist yet (landing page is showing), exit early
    if (!chatMessages || !userInput || !sendButton || !clearButton || !retryButton) {
        return;
    }

    // Configure marked.js
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send message on Enter (without Shift)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', () => sendMessage());

    // Clear chat history
    clearButton.addEventListener('click', async () => {
        clearButton.classList.add('deleting');
        chatMessages.innerHTML = '';
        // Clear backend chat history
        try {
            await fetch('/api/history', { method: 'DELETE' });
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }
        setTimeout(() => clearButton.classList.remove('deleting'), 300);
    });

    // Function to send user message and get response
    async function sendMessage(customMessage = null) {
        const message = customMessage || userInput.value.trim();
        if (!message) return;

        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';

        // Add user message to UI
        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'message user';
        userMessageElement.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(userMessageElement);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message assistant';
        loadingElement.innerHTML = `<p>Thinking...</p>`;
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            if (response.ok) {
                // Parse markdown
                const sanitizedHTML = DOMPurify.sanitize(marked.parse(data.response));

                // Replace loading indicator with response
                loadingElement.innerHTML = sanitizedHTML;

                // Highlight code blocks
                loadingElement.querySelectorAll('pre code').forEach((block) => {
                    Prism.highlightElement(block);
                });
            } else {
                loadingElement.innerHTML = `<p>Error: ${data.error || 'Failed to get response'}</p>`;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            loadingElement.innerHTML = `<p>Error: Could not connect to the server</p>`;
        }

        // Scroll to bottom again
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Retry last message
    retryButton.addEventListener('click', async () => {
        const messages = chatMessages.getElementsByClassName('message');
        if (messages.length >= 2) {
            // Get the last user message
            let lastUserMessage = '';
            let lastAIMessageIndex = -1;

            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].classList.contains('assistant')) {
                    lastAIMessageIndex = i;
                    break;
                }
            }

            // Find the user message before the last AI message
            for (let i = lastAIMessageIndex - 1; i >= 0; i--) {
                if (messages[i].classList.contains('user')) {
                    lastUserMessage = messages[i].querySelector('p') ? 
                                     messages[i].querySelector('p').textContent : 
                                     messages[i].textContent;
                    break;
                }
            }

            if (lastUserMessage && lastAIMessageIndex !== -1) {
                // Remove the last AI response
                messages[lastAIMessageIndex].remove();
                // Resend the last user message
                await sendMessage(lastUserMessage);
            }
        }
    });

    // Function to load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch('/api/history');
            const history = await response.json();

            history.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.className = `message ${msg.role}`;

                if (msg.role === 'assistant') {
                    // Parse markdown for assistant messages
                    const sanitizedHTML = DOMPurify.sanitize(marked.parse(msg.message));
                    messageElement.innerHTML = sanitizedHTML;

                    // Highlight code blocks
                    setTimeout(() => {
                        messageElement.querySelectorAll('pre code').forEach((block) => {
                            Prism.highlightElement(block);
                        });
                    }, 0);
                } else {
                    messageElement.innerHTML = `<p>${msg.message}</p>`;
                }

                chatMessages.appendChild(messageElement);
            });

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Load chat history
    loadChatHistory();

    // Make sendMessage accessible globally
    window.sendMessage = sendMessage;

    async function loadChatHistory() {
        try {
            const response = await fetch('/api/history');
            const history = await response.json();
            history.forEach(msg => {
                appendMessage(msg.message, msg.role);
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    async function sendMessage(customMessage = null) {
        const message = customMessage || userInput.value.trim();
        if (!message) return;

        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';

        // Append user message
        appendMessage(message, 'user');

        try {
            // Show loading indicator
            const loadingMsg = appendMessage('Thinking...', 'assistant');

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Remove loading message
            loadingMsg.remove();

            // Append AI response
            appendMessage(data.response, 'assistant', true);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Sorry, I encountered an error. Please try again.', 'assistant', true);
        }
    }

    function appendMessage(content, role, animate = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role} ${animate ? 'typing-effect' : ''}`;

        // Prepare the final HTML content
        let finalContent;
        if (content.includes('```')) {
            // For code blocks, prepare the content
            finalContent = formatMessageWithCode(content);
        } else {
            // Parse markdown for non-code messages
            const parsedContent = marked.parse(content);
            finalContent = DOMPurify.sanitize(parsedContent, {
                ADD_ATTR: ['target']
            });
        }

        // Add copy button for AI messages
        if (role === 'assistant') {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.addEventListener('click', () => {
                // Get only the text content from the message, ignore HTML tags
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                        }, 2000);
                    });
            });
            messageDiv.appendChild(copyBtn);
        }

        if (animate && role === 'assistant') {
            // For AI responses with animation
            messageDiv.innerHTML = '';
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Wait a short moment before starting the animation
            setTimeout(() => {
                // Pass the pre-rendered HTML to the typewriter animation
                typewriterAnimation(messageDiv, finalContent, 8);
            }, 300);
        } else {
            // For user messages or non-animated content
            messageDiv.innerHTML = finalContent;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        return messageDiv;
    }

    // Load chat history when page loads
    loadChatHistory();

    // Add delegated event listener for code copy buttons
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.classList.contains('code-copy-btn') || 
                         e.target.parentElement.classList.contains('code-copy-btn'))) {
            const button = e.target.classList.contains('code-copy-btn') ? 
                           e.target : e.target.parentElement;
            const codeBlock = button.nextElementSibling;
            const code = codeBlock.querySelector('code');
            const codeText = code.textContent || code.innerText;

            navigator.clipboard.writeText(codeText)
                .then(() => {
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        button.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy code: ', err);
                    button.innerHTML = '<i class="fas fa-times"></i> Failed';
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
        }
    });
});