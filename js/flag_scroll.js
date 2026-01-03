$(document).ready(function () {
  $(".under_block a").on("click", function (event) {
    event.preventDefault();

    var targetPos = $(".top_block").offset().top;
    $("html, body").animate(
      {
        scrollTop: targetPos,
      },
      600
    );
  });
});


// header聯絡按鈕移動至聯絡我們區塊
$(document).ready(function() {
    
    $('#contact_with').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.contact').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});


// header聯絡按鈕移動至合作流程區塊
$(document).ready(function() {
    
    $('#teamwork').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.partnership_process').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

$(document).ready(function() {
    
    $('#firm').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.best_choice').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

$(document).ready(function() {
    
    $('#customer_service').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.customer_support').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

$(document).ready(function() {
    
    $('#safe_pay').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.security_solution').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

$(document).ready(function() {
    
    $('#service_map').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.world_map').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

$(document).ready(function() {
    
    $('#promot').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.market_plan_outer').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});

// banner 了解更多icon，點擊移動至下方info_board
$(document).ready(function() {
    
    $('#you_know').on('click', function(event) {
        event.preventDefault();
        var targetSection = $('.info_board').offset().top;
        $('html, body').animate({
            scrollTop: targetSection
        }, 800); 
    });
});