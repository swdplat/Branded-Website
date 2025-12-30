$(document).ready(function() {
    var $worldMap = $('.world_map');
    var isCtrlPressed = false;

    // 定義一個判斷是否為手機版的函數
    function isMobile() {
        return $(window).width() < 576;
    }

    // 初始化檢查：如果是手機版，直接給予 active 狀態（移除 blocker）
    function checkDevice() {
        if (isMobile()) {
            $worldMap.addClass('active').removeClass('show-hint');
        } else {
            // 回到電腦版時，如果沒按 Ctrl 就移除 active
            if (!isCtrlPressed) {
                $worldMap.removeClass('active');
            }
        }
    }

    // 初始執行一次
    checkDevice();

    // 監聽視窗縮放，動態切換模式
    $(window).on('resize', function() {
        checkDevice();
    });

    // 1. 監聽鍵盤：控制 blocker 的開關 (僅在非手機版有效)
    $(window).on('keydown', function(e) {
        if (isMobile()) return; // 手機版不執行

        if (e.ctrlKey || e.metaKey) {
            isCtrlPressed = true;
            $worldMap.addClass('active').removeClass('show-hint');
        }
    });

    $(window).on('keyup', function(e) {
        if (isMobile()) return; // 手機版不執行

        if (!e.ctrlKey && !e.metaKey) {
            isCtrlPressed = false;
            $worldMap.removeClass('active');
        }
    });

    // 2. 偵測滾輪
    $('.map-blocker').on('wheel', function(e) {
        // 如果是手機版，或是已經按住 Ctrl，就不顯示提示
        if (isMobile() || isCtrlPressed) return;

        // 顯示提示
        $worldMap.addClass('show-hint');

        // 兩秒後隱藏
        clearTimeout(window.mapTimer);
        window.mapTimer = setTimeout(function() {
            $worldMap.removeClass('show-hint');
        }, 2000);
    });

    // 3. 滑鼠移開地圖區域自動重置
    $worldMap.on('mouseleave', function() {
        if (!isMobile()) {
            $worldMap.removeClass('show-hint');
        }
    });
});