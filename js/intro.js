document.addEventListener('DOMContentLoaded', function() {
    const navigation = document.getElementById('navigation');

    // Show navigation after logo animations complete
    setTimeout(() => {
        navigation.classList.remove('hidden');
        navigation.classList.add('show');
    }, 4500); // Delay to ensure animations are finished

    // Add click handler for the navigation button
    const navButton = document.querySelector('.nav-button');
    if (navButton) {
        navButton.addEventListener('click', function() {
            // Add a visual click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }

    // Keyboard navigation (Enter or Spacebar)
    document.addEventListener('keydown', function(e) {
        if (navigation.classList.contains('show') && (e.key === 'Enter' || e.key === ' ')) {
            // Find the button and navigate to its target
            const targetHref = navButton.onclick.toString().match(/'([^']+)'/)[1];
            if (targetHref) {
                window.location.href = targetHref;
            }
        }
    });

    // Preload the game selection page for faster navigation
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'prefetch';
    preloadLink.href = 'pick_games.html';
    document.head.appendChild(preloadLink);
});
