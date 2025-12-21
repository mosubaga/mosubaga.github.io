document.addEventListener('DOMContentLoaded', () => {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active class on the button
            button.classList.toggle('active');
            
            // Get the content panel
            const content = button.nextElementSibling;
            
            // Toggle active class on the content
            content.classList.toggle('active');
            
            // Close other accordion items if they're open
            accordionButtons.forEach(otherButton => {
                if (otherButton !== button) {
                    otherButton.classList.remove('active');
                    otherButton.nextElementSibling.classList.remove('active');
                }
            });
        });
    });
});
