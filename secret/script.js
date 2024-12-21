document.addEventListener('DOMContentLoaded', function() {
    const text = document.querySelector('.rotating-text');
    let degree = 0;

    function rotate() {
        degree += 75;
        text.style.transform = `rotate(${degree}deg)`;
        requestAnimationFrame(rotate);
    }

    rotate();

    document.addEventListener('contextmenu', e => e.preventDefault());
    
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
        }
    });
});