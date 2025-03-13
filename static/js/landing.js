
document.addEventListener('DOMContentLoaded', () => {
    const startChatButton = document.getElementById('start-chat');
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.getElementById('app-container');
    
    // Check if the user has already started chatting
    const hasStartedChat = sessionStorage.getItem('hasStartedChat');
    
    if (hasStartedChat) {
        // Skip landing page if user has already started chatting
        landingPage.style.display = 'none';
        appContainer.classList.add('visible');
    }
    
    startChatButton.addEventListener('click', () => {
        // Start transition
        landingPage.style.opacity = '0';
        landingPage.style.transform = 'translateY(-20px)';
        
        // Show app after short delay
        setTimeout(() => {
            landingPage.style.display = 'none';
            appContainer.classList.add('visible');
            
            // Focus the input field
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.focus();
            }
            
            // Remember that user has started chatting
            sessionStorage.setItem('hasStartedChat', 'true');
        }, 500);
    });
});
