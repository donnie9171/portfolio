document.addEventListener("DOMContentLoaded", function() {
    console.log("hello! this is the about page");
    // 3D hover effect for .trading-card-modal-card
    document.querySelectorAll('.trading-card-modal-card').forEach(card => {
        function handleMove(e) {
            const rect = card.getBoundingClientRect();
            let x, y;
            if (e.touches && e.touches.length) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 3;
            const rotateX = -((y - centerY) / centerY) * 3;
            card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
            card.style.zIndex = 2;
        }
        function handleLeave() {
            card.style.transform = '';
            card.style.zIndex = '';
        }
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
        card.addEventListener('touchmove', handleMove);
        card.addEventListener('touchend', handleLeave);
    });
    // Trigger when core-values-section scrolls into view
    const coreValuesSection = document.querySelector('.core-values-section');
    if (coreValuesSection) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger your event here
                    console.log('Core Values section is in view!');
                    window.notifyNewCard(["Perseverance of an Engineer", "Passion of an Artist", "Curiosity of a Child"]);
                    observer.unobserve(coreValuesSection); // Only trigger once
                }
            });
        }, {
            threshold: 0.3 // Adjust as needed
        });
        observer.observe(coreValuesSection);
    }
    
});