// Typewriter animation for AI responses
function updateCopyButtonsAfterAnimation(element) {
    // Add copy buttons to code blocks after animation completes
    const codeBlocks = element.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        // Skip if already has a copy button
        if (block.querySelector('.code-copy-btn')) return;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyBtn.onclick = function() { copyCodeToClipboard(this); };
        block.insertBefore(copyBtn, block.firstChild);
    });
}
function typewriterAnimation(element, text, speed = 20) {
    // Clear the element first
    element.innerHTML = '';

    // Add the pre-rendered HTML to the element
    // This is a critical change - we're not typing character by character
    // but inserting the fully rendered HTML and making it visible gradually
    element.innerHTML = text;

    // Create spans for each character/element to animate them
    let allElements = Array.from(element.querySelectorAll('*'));
    let allTextNodes = [];

    // Get all text nodes
    function getTextNodes(element) {
        if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) {
            allTextNodes.push(element);
        } else {
            for (let i = 0; i < element.childNodes.length; i++) {
                getTextNodes(element.childNodes[i]);
            }
        }
    }

    // Process text nodes 
    getTextNodes(element);

    // Hide all elements initially
    allElements.forEach(el => {
        if (!el.classList.contains('typing-cursor')) {
            el.style.visibility = 'hidden';
        }
    });

    // Add a blinking cursor at the end
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    cursorSpan.textContent = '▋';
    element.appendChild(cursorSpan);

    // Show elements gradually
    let currentIndex = 0;
    function revealNextElement() {
        if (currentIndex < allElements.length) {
            // Skip code blocks for instant display
            if (allElements[currentIndex].classList && 
                (allElements[currentIndex].classList.contains('code-block') || 
                 allElements[currentIndex].classList.contains('language-'))) {
                // For code blocks, reveal all at once
                allElements[currentIndex].style.visibility = 'visible';
                if (allElements[currentIndex].querySelectorAll) {
                    Array.from(allElements[currentIndex].querySelectorAll('*')).forEach(el => {
                        el.style.visibility = 'visible';
                    });
                }
            } else {
                allElements[currentIndex].style.visibility = 'visible';
            }
            currentIndex++;
            setTimeout(revealNextElement, speed * 3);
        } else {
            // When all elements are revealed, remove cursor and add copy buttons
            setTimeout(() => {
                cursorSpan.remove();
                updateCopyButtonsAfterAnimation(element);
            }, 500);
        }
    }

    // Start the animation
    setTimeout(revealNextElement, speed);

    // Scroll to the bottom as we type
    element.parentNode.scrollTop = element.parentNode.scrollHeight;
}