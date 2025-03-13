document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    
    function setTheme(isDark) {
        if (isDark) {
            root.style.setProperty('--bg-primary', 'var(--bg-primary-dark)');
            root.style.setProperty('--bg-secondary', 'var(--bg-secondary-dark)');
            root.style.setProperty('--text-primary', 'var(--text-primary-dark)');
            root.style.setProperty('--accent', 'var(--accent-dark)');
            root.style.setProperty('--neon-glow', 'var(--neon-glow-dark)');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        } else {
            root.style.setProperty('--bg-primary', 'var(--bg-primary-light)');
            root.style.setProperty('--bg-secondary', 'var(--bg-secondary-light)');
            root.style.setProperty('--text-primary', 'var(--text-primary-light)');
            root.style.setProperty('--accent', 'var(--accent-light)');
            root.style.setProperty('--neon-glow', 'var(--neon-glow-light)');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('light-theme');
        setTheme(isDark);
    });
});
