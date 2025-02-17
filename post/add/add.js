document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.querySelector('.post-form');
    const titleInput = document.querySelector('input[type="text"]');
    const contentTextarea = document.querySelector('textarea');
    const submitButton = document.querySelector('.submit-button');
    const fileInput = document.querySelector('.attach-button');
    const helperText = document.querySelector('.helper-text');

    // 숨겨진 파일 업로드 input 요소 생성
    const realFileInput = document.createElement('input');
    realFileInput.type = 'file';
    realFileInput.accept = 'image/*'; // 이미지 파일만 허용
    realFileInput.style.display = 'none';
    document.body.appendChild(realFileInput);

    let uploadedImage = null;

    // 드롭다운 메뉴 관련 요소
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');

    // 드롭다운 메뉴 토글
    profileDropdown.addEventListener('click', function(e) {
        menuList.classList.toggle('show');
        e.stopPropagation();
    });

    // 다른 곳 클릭시 드롭다운 닫기
    document.addEventListener('click', function() {
        menuList.classList.remove('show');
    });

    // 파일 선택 버튼 클릭 시 파일 업로드 트리거
    fileInput.addEventListener('click', function() {
        realFileInput.click();
    });

    // 파일 선택 시 이미지 업로드 처리
    realFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];

        if (file) {
            // 이미지 파일인지 확인
            if (!file.type.startsWith('image/')) {
                helperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
                helperText.style.color = 'red';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = event.target.result; // Base64 데이터 저장
            };
            reader.readAsDataURL(file);

            helperText.textContent = `* ${file.name} 선택됨`;
            helperText.style.color = 'green';
        }
    });

    // 제목과 본문 입력 여부에 따라 완료 버튼 상태 변경
    function updateSubmitButton() {
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();

        if (title && content) {
            submitButton.style.backgroundColor = '#7F6AEE'; // 활성화 색상
            submitButton.disabled = false;
            helperText.textContent = '';
        } else {
            submitButton.style.backgroundColor = '#ACA0EB'; // 비활성화 색상
            submitButton.disabled = true;
            helperText.textContent = '* 제목, 내용을 모두 작성해주세요';
            helperText.style.color = 'red';
        }
    }

    titleInput.addEventListener('input', updateSubmitButton);
    contentTextarea.addEventListener('input', updateSubmitButton);

    // 폼 제출 시 데이터 저장
    postForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();

        if (!title || !content) {
            helperText.textContent = '* 제목, 내용을 모두 작성해주세요';
            helperText.style.color = 'red';
            return;
        }

        const postData = {
            title,
            content,
            image: uploadedImage,
            createdAt: new Date().toISOString(),
        };

        // localStorage에 저장
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        posts.push(postData);
        localStorage.setItem('posts', JSON.stringify(posts));

        // 메인 페이지로 이동
        window.location.href = 'index.html';
    });

    updateSubmitButton(); // 초기 상태 설정
});
