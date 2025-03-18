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

    // 게시글 목록 가져오기 함수
    async function fetchPosts() {
        try {
            // API를 통해 게시글 목록 가져오기 (페이지는 1부터 시작)
            const response = await postAPI.getPosts(1);
            console.log('API 응답:', response);
            displayPosts(response);
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
    function displayPosts(data) {
        const postList = document.querySelector('.post-list');
        postList.innerHTML = ''; // 기존 목록 초기화
        
        console.log('원본 데이터:', data);
        
        // 데이터 구조가 어떤 형태인지 깊이 살펴보기
        let posts = data;
        
        // API 응답 구조 검사 (data가 API 응답 객체인 경우)
        if (!Array.isArray(data) && data !== null && typeof data === 'object') {
            // 가능한 필드들을 출력해 확인
            console.log('데이터 필드:', Object.keys(data));
            
            // PostListResponse 구조인 경우
            if (data.posts && Array.isArray(data.posts)) {
                posts = data.posts;
                console.log('posts 필드 발견:', posts);
            }
            // 다른 구조인 경우 (data 자체가 응답 객체인 경우)
            else if (data.data) {
                console.log('data 필드 발견:', data.data);
                if (Array.isArray(data.data)) {
                    posts = data.data;
                } else if (data.data.posts && Array.isArray(data.data.posts)) {
                    posts = data.data.posts;
                    console.log('data.posts 필드 발견:', posts);
                }
            }
        }
        
        if (!Array.isArray(posts)) {
            console.error('배열 형태의 게시글을 찾을 수 없습니다:', data);
            postList.innerHTML = '<div class="no-posts">데이터 형식 오류</div>';
            return;
        }
        
        if (posts.length === 0) {
            postList.innerHTML = '<div class="no-posts">게시글이 없습니다.</div>';
            return;
        }
        
        // 첫 번째 게시글의 구조를 확인해 필드명 파악
        const firstPost = posts[0];
        console.log('첫 번째 게시글 구조:', firstPost);
        console.log('첫 번째 게시글 필드:', Object.keys(firstPost));
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            
            // ID 필드명 유연하게 처리 (id 또는 postId)
            const postId = post.postId || post.id;
            postElement.dataset.postId = postId;
            
            // 작성자 관련 필드 유연하게 처리
            const authorName = post.authorNickname || post.author || '익명';
            const authorImg = post.authorProfileImage || post.authorImage || '/images/default-profile.png';
            
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-info">
                    <span>좋아요 ${post.likes || 0} 댓글 ${post.comments || 0} 조회수 ${post.views || 0}</span>
                    <span class="date">${new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div class="post-author">
                    <img src="${authorImg}" alt="프로필" class="author-image">
                    <span>${authorName}</span>
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
                sessionStorage.removeItem('token');
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
        fetchPosts();
    }

    // 초기화 실행
    initialize();
});