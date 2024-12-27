document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.birthday-card');
    const particlesCanvas = document.getElementById('particles');
    const bgm = document.getElementById('bgm');
    const ctx = particlesCanvas.getContext('2d');

    // 設置畫布大小
    function setCanvasSize() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // 粒子系統
    class Particle {
        constructor() {
            this.x = Math.random() * particlesCanvas.width;
            this.y = Math.random() * particlesCanvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if(this.x > particlesCanvas.width) this.x = 0;
            if(this.x < 0) this.x = particlesCanvas.width;
            if(this.y > particlesCanvas.height) this.y = 0;
            if(this.y < 0) this.y = particlesCanvas.height;
        }

        draw() {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 調整粒子數量以優化手機效能
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const particleCount = isMobile ? 25 : 50;
    const particles = Array.from({length: particleCount}, () => new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    // 優化觸控體驗
    card.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止觸控時的閃爍
    });

    // 修改事件監聽，同時支援點擊和觸控
    const toggleCard = (e) => {
        e.preventDefault();
        card.classList.toggle('open');
        if(card.classList.contains('open')) {
            bgm.play().catch(err => console.log('自動播放被阻擋'));
        } else {
            bgm.pause();
            bgm.currentTime = 0;
        }
    };

    card.addEventListener('click', toggleCard);
    card.addEventListener('touchend', toggleCard);

    // 開始動畫
    animateParticles();
});
