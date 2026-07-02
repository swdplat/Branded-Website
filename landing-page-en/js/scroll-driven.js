$(document).ready(function () {
  // 監聽視窗捲動
  $(window).on("scroll", function () {
    let scrollTop = $(window).scrollTop();
    let windowHeight = $(window).height();
    let triggerPoint = scrollTop + windowHeight / 2; // 以視窗中間點作為觸發基準

    $(".all_service_item").each(function () {
      let blockTop = $(this).offset().top;
      let blockBottom = blockTop + $(this).outerHeight();
      let newImgUrl = $(this).data("img");

      // 判斷目前哪一個文字區塊正經過視窗中線
      if (triggerPoint >= blockTop && triggerPoint <= blockBottom) {
        // 1. 更新文字區塊的透明度狀態
        $(".all_service_item").removeClass("active");
        $(this).addClass("active");

        // 2. 更新圖片 (若圖片網址不同才更新，避免閃爍)
        let currentImgUrl = $("#market_photo").attr("src");
        if (currentImgUrl !== newImgUrl) {
          $("#market_photo")
            .stop()
            .fadeOut(300, function () {
              $(this).attr("src", newImgUrl).fadeIn(300);
            });
        }
      }
    });
  });
});
