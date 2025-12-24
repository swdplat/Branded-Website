$(document).ready(function() {
    
    // 數字增加的動畫函式
    function runCounter($el) {
        const target = parseFloat($el.attr('data-target'));
        
        $({ countNum: 0 }).animate({ countNum: target }, {
            duration: 2000, 
            easing: 'swing',
            step: function() {
                $el.text(Math.floor(this.countNum));
            },
            complete: function() {
                $el.text(target);
            }
        });
    }

    const observerOptions = {
        threshold: 0.5 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                $(entry.target).find('[class^="count_"]').each(function() {
                    runCounter($(this));
                });
              
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 開始監測 info_board 區塊
    const targetSection = document.querySelector('.info_board');
    if (targetSection) {
        observer.observe(targetSection);
    }
});