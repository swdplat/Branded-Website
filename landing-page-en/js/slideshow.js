$(document).ready(function() {
    let currentIndex = 0;
    const slides = $('.card_slideshow');          
    const images = $('.Whole_case_image img'); 
    const total = slides.length;
    let isAnimating = false;

    function moveSlide(direction) {
        if (isAnimating) return;
        isAnimating = true;

        let nextIndex;
        let startPos; 
        let endPos;   

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % total;
            startPos = '100%';
            endPos = '-100%';
        } else {
            nextIndex = (currentIndex - 1 + total) % total;
            startPos = '-100%';
            infoEndPos = '100%';
        }

        // --- 文字區塊：滑動效果 ---
        const $currSlide = slides.eq(currentIndex);
        const $nextSlide = slides.eq(nextIndex);

        $nextSlide.css({ left: startPos, display: 'block' });
        $currSlide.animate({ left: endPos }, 500);
        $nextSlide.animate({ left: '0%' }, 500, function() {
            $currSlide.hide().css('left', '0');
        });

        // --- 圖片區塊：淡入淡出效果 ---
        images.eq(currentIndex).fadeOut(500); 
        images.eq(nextIndex).fadeIn(500, function() {
            
            isAnimating = false;
        });

        // 更新索引
        currentIndex = nextIndex;
    }

    // 箭頭點擊事件
    $('.next_arrow').on('click', function() { moveSlide('next'); });
    $('.prev_arrow').on('click', function() { moveSlide('prev'); });
});