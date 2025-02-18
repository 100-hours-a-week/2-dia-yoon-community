document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    function checkLogin() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const currentUser = localStorage.getItem('currentUser');
        
        if (!isLoggedIn || !currentUser) {
            alert('로그인이 필요한 서비스입니다.');
            window.location.href = '../../auth/login/login.html';
            return false;
        }
        return true;
    }

    // 초기 로그인 체크
    if (!checkLogin()) return;

    // DOM 요소 선택
    const modifyForm = document.getElementById('modifyForm');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageInput = document.getElementById('image');
    const selectedFile = document.querySelector('.selected-file');
    const currentImage = document.getElementById('currentImage');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    const titleCounter = document.querySelector('.title-counter');

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // 기존 게시글 데이터 불러오기
    function loadPostData() {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(p => p.id === Number(postId));
        
        if (!post) {
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = '../index/index.html';
            return;
        }

        // 제목과 내용 설정
        titleInput.value = post.title;
        contentInput.value = post.content;
        titleCounter.textContent = `${post.title.length}/26`;

        // 이미지가 있는 경우 미리보기 표시
        if (post.image) {
            currentImage.innerHTML = `<img src="${post.image}" alt="현재 이미지">`;
            selectedFile.textContent = "현재 이미지가 있습니다";
        }
    }

    // 이미지 파일 선택 시 처리
    imageInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // 이미지 파일 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                this.value = '';
                return;
            }

            selectedFile.textContent = file.name;
            
            // 이미지 미리보기
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImage.innerHTML = `<img src="${e.target.result}" alt="선택된 이미지">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 제목 글자수 카운터
    titleInput.addEventListener('input', function() {
        const length = this.value.length;
        titleCounter.textContent = `${length}/26`;
        
        if (length > 26) {
            this.value = this.value.substring(0, 26);
            titleCounter.textContent = '26/26';
        }
    });

    // 폼 제출 처리
    modifyForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!titleInput.value.trim() || !contentInput.value.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === Number(postId));

        if (postIndex === -1) {
            alert('게시글을 찾을 수 없습니다.');
            return;
        }

        // 이미지 처리
        const reader = new FileReader();
        const processFormSubmission = (imageDataUrl = null) => {
            // 게시글 데이터 업데이트
            posts[postIndex] = {
                ...posts[postIndex],
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                modifiedAt: new Date().toISOString()
            };

            // 새 이미지가 있는 경우에만 이미지 업데이트
            if (imageDataUrl) {
                posts[postIndex].image = imageDataUrl;
            }

            localStorage.setItem('posts', JSON.stringify(posts));
            alert('게시글이 수정되었습니다.');
            window.location.href = `../detail/detail.html?id=${postId}`;
        };

        // 새로운 이미지 파일이 있는 경우
        if (imageInput.files && imageInput.files[0]) {
            reader.onload = function(e) {
                processFormSubmission(e.target.result);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // 새로운 이미지 파일이 없는 경우
            processFormSubmission();
        }
    });

    // 뒤로가기 버튼
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', function() {
        window.location.href = `../detail/detail.html?id=${postId}`;
    });

    // 드롭다운 메뉴 관련 이벤트
    profileDropdown.addEventListener('click', function(e) {
        menuList.classList.toggle('show');
        e.stopPropagation();
    });

    document.addEventListener('click', function() {
        menuList.classList.remove('show');
    });

    // 메뉴 항목 클릭 이벤트
    menuList.addEventListener('click', function(e) {
        const item = e.target;
        
        switch(item.textContent) {
            case '회원정보수정':
                window.location.href = '../../auth/profile/profile.html';
                break;
            case '비밀번호수정':
                window.location.href = '../../auth/password/password.html';
                break;
            case '로그아웃':
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                window.location.href = '../../auth/login/login.html';
                break;
        }
    });

    // 초기화
    loadPostData();
});