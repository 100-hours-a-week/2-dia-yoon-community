document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 가져오기
    const modifyForm = document.getElementById('modifyForm');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageInput = document.getElementById('image');
    const categorySelect = document.getElementById('category');
    const selectedFile = document.querySelector('.selected-file');
    const titleCounter = document.querySelector('.title-counter');
    const currentImage = document.getElementById('currentImage');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');

    // 프로필 드롭다운 메뉴 토글
    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        menuList.classList.toggle('show');
    });

    // 다른 곳 클릭시 드롭다운 메뉴 닫기
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target)) {
            menuList.classList.remove('show');
        }
    });

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // 제목 글자수 카운터
    titleInput.addEventListener('input', function() {
        const length = this.value.length;
        titleCounter.textContent = `${length}/26`;
        
        // 26자 초과 입력 방지
        if (length > 26) {
            this.value = this.value.substring(0, 26);
            titleCounter.textContent = '26/26';
        }
        
        // 글자수에 따른 스타일 변경
        if (length >= 26) {
            titleCounter.style.color = '#ff4444';
        } else {
            titleCounter.style.color = '#666';
        }
    });

    // 기존 게시글 데이터 불러오기
    async function loadPostData() {
        try {
            // API 호출을 통해 기존 게시글 데이터를 가져오는 로직
            const response = await fetch(`/api/posts/${postId}`);
            if (!response.ok) throw new Error('게시글을 불러오는데 실패했습니다.');
            
            const data = await response.json();
            
            // 폼에 데이터 설정
            categorySelect.value = data.category;
            titleInput.value = data.title;
            contentInput.value = data.content;
            
            // 글자수 카운터 업데이트
            titleCounter.textContent = `${data.title.length}/26`;
            
            // 기존 이미지가 있다면 표시
            if (data.imageUrl) {
                currentImage.innerHTML = `
                    <img src="${data.imageUrl}" alt="현재 이미지">
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('게시글 데이터를 불러오는데 실패했습니다.');
        }
    }

    // 이미지 파일 선택 시 파일명 표시
    imageInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            selectedFile.textContent = file.name;
            
            // 이미지 미리보기 생성
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImage.innerHTML = `
                    <img src="${e.target.result}" alt="선택된 이미지">
                `;
            };
            reader.readAsDataURL(file);
        } else {
            selectedFile.textContent = '';
        }
    });

    // 폼 제출 처리
    modifyForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 입력값 검증
        if (!titleInput.value.trim() || !contentInput.value.trim() || !categorySelect.value) {
            alert('카테고리, 제목, 내용을 모두 입력해주세요.');
            return;
        }

        if (titleInput.value.length > 26) {
            alert('제목은 26자를 초과할 수 없습니다.');
            return;
        }

        try {
            // FormData 객체 생성
            const formData = new FormData();
            formData.append('category', categorySelect.value);
            formData.append('title', titleInput.value);
            formData.append('content', contentInput.value);
            if (imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            // API 호출을 통한 데이터 전송
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                throw new Error('게시글 수정에 실패했습니다.');
            }

            alert('게시글이 성공적으로 수정되었습니다.');
            // 게시글 상세 페이지로 이동
            window.location.href = `/post/${postId}`;

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

    // 뒤로가기 버튼 처리
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', function() {
        window.history.back();
    });

    // 페이지 로드 시 기존 데이터 불러오기
    loadPostData();
});