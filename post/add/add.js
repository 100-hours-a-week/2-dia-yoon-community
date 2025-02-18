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
 
    // DOM 요소
    const postForm = document.querySelector('.post-form');
    const titleInput = document.getElementById('title');
    const contentTextarea = document.getElementById('content');
    const fileInput = document.querySelector('.attach-button');
    const helperText = document.querySelector('.helper-text');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
 
    // 현재 로그인한 사용자 정보 표시
    function displayUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.profileImage) {
            profileDropdown.src = currentUser.profileImage;
        }
    }
 
    // 숨겨진 파일 업로드 input 요소 생성
    const realFileInput = document.createElement('input');
    realFileInput.type = 'file';
    realFileInput.accept = 'image/*';
    realFileInput.style.display = 'none';
    document.body.appendChild(realFileInput);
 
    let uploadedImage = null;
 
    // 드롭다운 메뉴 토글
    profileDropdown.addEventListener('click', function(e) {
        menuList.classList.toggle('show');
        e.stopPropagation();
    });
 
    // 다른 곳 클릭시 드롭다운 닫기
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
 
    // 파일 선택 버튼 클릭 시 파일 업로드 트리거
    fileInput.addEventListener('click', function() {
        realFileInput.click();
    });
 
    // 파일 선택 시 이미지 업로드 처리
    realFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
 
        if (file) {
            if (!file.type.startsWith('image/')) {
                helperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
                helperText.style.color = 'red';
                return;
            }
 
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = event.target.result;
            };
            reader.readAsDataURL(file);
 
            helperText.textContent = `* ${file.name} 선택됨`;
            helperText.style.color = 'green';
        }
    });
 
    // 폼 제출 이벤트
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
 
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            
            const postData = {
                id: Date.now(),
                title,
                content,
                image: uploadedImage,
                createdAt: new Date().toISOString(),
                author: currentUser.nickname,
                authorImage: currentUser.profileImage,
                likes: 0,
                comments: 0,
                views: 0
            };
 
            posts.unshift(postData);
            localStorage.setItem('posts', JSON.stringify(posts));
            alert('게시글이 등록되었습니다.');
            window.location.href = '../index/index.html';
        } catch (error) {
            console.error('게시글 저장 중 오류 발생:', error);
            alert('게시글 등록에 실패했습니다.');
        }
    });
 
    // 초기화
    displayUserInfo();
 });