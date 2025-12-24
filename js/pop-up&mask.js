        // 取得 DOM 元素
        const modalOverlay = document.getElementById('myModal');
        const closeButton = document.querySelector('.close-button');
        const contentDisplay = document.getElementById('modalContentDisplay'); 
        const openButtons = document.querySelectorAll('.openModalBtn'); 

        // --- 函式：開啟模態框 (載入內容並顯示) ---
        function openModal(event) {
            event.preventDefault(); 
            
            const targetId = event.currentTarget.getAttribute('data-target');
            const template = document.getElementById(targetId);
            
            if (template) {
                const contentClone = template.cloneNode(true); 
                contentDisplay.innerHTML = '';
                contentDisplay.appendChild(contentClone);
                
                modalOverlay.classList.add('show');
            }
        }

        // --- 函式：關閉模態框 ---
        function closeModal() {
            modalOverlay.classList.remove('show');
            
            setTimeout(() => {
                contentDisplay.innerHTML = '';
            }, 300); 
        }

        // --- 監聽事件綁定 ---

        openButtons.forEach(button => {
            button.addEventListener('click', openModal);
        });

        closeButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });