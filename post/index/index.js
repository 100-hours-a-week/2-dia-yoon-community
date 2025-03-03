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

    // 드롭다운 메뉴 관련 요소
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');

    // 사용자 정보 표시
    function displayUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            // 프로필 이미지가 있다면 업데이트
            if (currentUser.profileImage) {
                profileDropdown.src = currentUser.profileImage;
            }
        }
    }

    // API URL (실제 환경에서는 실제 API 엔드포인트로 대체)
    const API_URL = 'https://api.example.com/posts';

    // Fetch를 사용하여 게시글 목록 가져오기
    async function fetchPosts() {
        try {
            const response = await fetch(API_URL);
            
            // 서버 응답 검사
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const posts = await response.json();
            displayPosts(posts);
        } catch (error) {
            console.error('게시글을 불러오는 중 오류 발생:', error);
            // API 요청이 실패한 경우 대체로 localStorage 데이터 사용
            const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');
            displayPosts(localPosts);
            
            // 사용자에게 오류 알림
            alert('게시글을 불러오는데 문제가 발생했습니다. 로컬 데이터를 표시합니다.');
        }
    }

    // 게시글 목록 표시 함수
    function displayPosts(posts) {
        const postList = document.querySelector('.post-list');
        postList.innerHTML = ''; // 기존 목록 초기화

        if (posts.length === 0) {
            postList.innerHTML = '<div class="no-posts">게시글이 없습니다.</div>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.dataset.postId = post.id;
            
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-info">
                    <span>좋아요 ${post.likes || 0} 댓글 ${post.comments || 0} 조회수 ${post.views || 0}</span>
                    <span class="date">${new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div class="post-author">
                    <img src="${post.authorImage || '../images/default-profile.png'}" alt="프로필" class="author-image">
                    <span>${post.author}</span>
                </div>
            `;
            
            postList.appendChild(postElement);
        });
    }

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
                // 로그아웃 처리
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                window.location.href = '../../auth/login/login.html';
                break;
        }
    });

    // 게시글 작성 버튼 이벤트
    const writeButton = document.querySelector('.write-button');
    if (writeButton) {
        writeButton.addEventListener('click', function() {
            window.location.href = '../add/add.html';
        });
    }

    // 게시글 클릭 이벤트 처리
    const postList = document.querySelector('.post-list');
    postList.addEventListener('click', function(e) {
        // 클릭된 요소가 post-item이거나 그 하위 요소인 경우
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            const postId = postItem.dataset.postId;
            // 상세 페이지로 이동
            window.location.href = `../detail/detail.html?id=${postId}`;
        }
    });

    // 초기화 함수
    function initialize() {
        displayUserInfo();
        fetchPosts(); // localStorage 직접 접근하는 대신 fetch 사용
    }

    // 초기화 실행
    initialize();
});