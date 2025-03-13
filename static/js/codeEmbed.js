function formatMessageWithCode(content) {
    const blocks = content.split('```');
    let formatted = '';

    blocks.forEach((block, index) => {
        if (index % 2 === 0) {
            // Regular text - parse as markdown
            const parsedContent = marked.parse(block);
            formatted += DOMPurify.sanitize(parsedContent);
        } else {
            // Code block
            const firstLineBreak = block.indexOf('\n');
            const language = block.substring(0, firstLineBreak).trim() || 'plaintext';
            const code = block.substring(firstLineBreak + 1).trim();

            formatted += `
                <div class="code-block">
                    <button class="code-copy-btn">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
                </div>
            `;
        }

// Function to copy code block content to clipboard
function copyCodeToClipboard(button) {
    const codeBlock = button.nextElementSibling.querySelector('code');
    const codeText = codeBlock.textContent || codeBlock.innerText;
    
    navigator.clipboard.writeText(codeText)
        .then(() => {
            // Show feedback
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            // Reset button text after 2 seconds
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

    // Highlight code blocks
    setTimeout(() => {
        Prism.highlightAll();
    }, 0);

    return formatted;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}