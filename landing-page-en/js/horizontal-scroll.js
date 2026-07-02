$(document).ready(function() {
    const $container = $('.service_intro');
    const $items = $('.all_service_item');
    const $dots = $('.dot');

    function updateActiveDot() {
        if (window.innerWidth <= 576) {
            const scrollLeft = $container.scrollLeft();
            // 計算每一格的寬度（卡片 90% + margin 15px）
            const itemWidth = $items.first().outerWidth() + 15;
            
            // 計算目前的 Index
            let index = Math.round(scrollLeft / itemWidth);
            index = Math.max(0, Math.min(index, $items.length - 1));

            // 僅更新 Dot 狀態
            $dots.removeClass('active');
            $dots.eq(index).addClass('active');
        }
    }

    // 監聽水平捲動
    $container.on('scroll', function() {
        // 使用 debounce 或 requestAnimationFrame 節流
        window.requestAnimationFrame(updateActiveDot);
    });

    // 點擊 Dot 跳轉
    $dots.on('click', function() {
        const index = $(this).index();
        const itemWidth = $items.first().outerWidth() + 15;
        $container.stop().animate({
            scrollLeft: index * itemWidth
        }, 400);
    });

    // 視窗縮放時校正
    $(window).on('resize', updateActiveDot);
    
    // 初始執行
    updateActiveDot();
});