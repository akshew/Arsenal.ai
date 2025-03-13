document.addEventListener('DOMContentLoaded', () => {
    const particles = Particles.init({
        selector: '#particles',
        color: ['#00ff9d', '#38bdf8', '#818cf8'],
        connectParticles: true,
        responsive: [
            {
                breakpoint: 768,
                options: {
                    maxParticles: 40
                }
            }
        ],
        maxParticles: 80,
        sizeVariations: 2,
        speed: 0.5,
        minDistance: 120,
        opacity: 0.3,
        lineLinked: {
            opacity: 0.15
        }
    });
});