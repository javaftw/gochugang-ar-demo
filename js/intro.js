document.addEventListener('DOMContentLoaded', function() {
    const navigation = document.getElementById('navigation');

    // Show navigation after both animations complete
    // GOCHU animation: 4 seconds
    // GAMES animation: starts at 2s, runs for 2s (total 4s)
    // Add a small delay to ensure both animations are complete
    setTimeout(() => {
        navigation.classList.remove('hidden');
        navigation.classList.add('show');
    }, 4500); // 4.5 seconds to ensure animations are complete

    // Add click handlers for navigation buttons
    const navButtons = document.querySelectorAll('.nav-button');

    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Optional: Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (navigation.classList.contains('show')) {
            switch(e.key) {
                case '1':
                case 'a':
                case 'A':
                    window.location.href = 'game_ar.html';
                    break;
                case '2':
                case 'd':
                case 'D':
                    window.location.href = 'game_2d.html';
                    break;
            }
        }
    });

    // Optional: Preload the other pages for faster navigation
    const preloadLinks = ['game_ar.html', 'game_2d.html'];
    preloadLinks.forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = link;
        document.head.appendChild(linkElement);
    });
});