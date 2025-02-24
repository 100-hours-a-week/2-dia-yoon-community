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
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    const postTitle = document.querySelector('.post-title');
    const postContent = document.querySelector('.post-text');
    const authorImage = document.querySelector('.author-image');
    const authorName = document.querySelector('.author-name');
    const postDate = document.querySelector('.post-date');
    const postImageContainer = document.querySelector('.post-image');
    const postImage = postImageContainer.querySelector('img');
    const postActions = document.querySelector('.post-actions');
    const backBtn = document.querySelector('.back-btn');
 
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
 
    // 게시글 데이터 로드
    function loadPostData() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(p => p.id === Number(postId));
 
        if (!post) {
            alert('게시글을 찾을 수 없습니다.');
            window.location.href = '../index/index.html';
            return;
        }
 
        // 게시글 제목 설정
        if (postTitle) {
            postTitle.textContent = post.title;
        }
 
        // 게시글 내용 설정
        if (postContent) {
            postContent.textContent = post.content;
        }
 
        // 작성자 정보 설정
        if (authorImage) {
            authorImage.src = post.authorImage || '../images/default-profile.png';
        }
        if (authorName) {
            authorName.textContent = post.author;
        }
 
        // 게시글 날짜 설정
        if (postDate) {
            postDate.textContent = new Date(post.createdAt).toLocaleString();
        }
 
        // 게시글 이미지 설정
        if (postImage && post.image) {
            postImage.src = post.image;
            postImage.style.display = 'block';
        } else if (postImage) {
            postImage.style.display = 'none';
        }
 
        // 통계 정보 업데이트
        const [likeStat, viewStat, commentStat] = document.querySelectorAll('.stat-value');
        if (likeStat) likeStat.textContent = post.likes || 0;
        if (viewStat) viewStat.textContent = post.views || 0;
        if (commentStat) commentStat.textContent = post.comments || 0;
 
        // 수정/삭제 버튼 표시 (작성자만)
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (postActions) {
            if (currentUser && currentUser.nickname === post.author) {
                postActions.innerHTML = `
                    <button class="action-btn modify-btn">수정</button>
                    <button class="action-btn delete-btn">삭제</button>
                `;
 
                // 수정 버튼 클릭 이벤트
                const modifyBtn = postActions.querySelector('.modify-btn');
                modifyBtn.addEventListener('click', function() {
                    window.location.href = `../modify/modify.html?id=${postId}`;
                });
 
                // 삭제 버튼 클릭 이벤트
                const deleteBtn = postActions.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', function() {
                    if(confirm('정말 삭제하시겠습니까?')) {
                        const updatedPosts = posts.filter(p => p.id !== Number(postId));
                        localStorage.setItem('posts', JSON.stringify(updatedPosts));
                        alert('게시글이 삭제되었습니다.');
                        window.location.href = '../index/index.html';
                    }
                });
            } else {
                postActions.style.display = 'none';
            }
        }
 
        // 조회수 증가
        post.views = (post.views || 0) + 1;
        localStorage.setItem('posts', JSON.stringify(posts));
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
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                window.location.href = '../../auth/login/login.html';
                break;
        }
    });
 
    // 뒤로가기 버튼
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '../index/index.html';
        });
    }
 
    // 이미지 로드 에러 처리
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            this.src = '../images/default-profile.png';
        };
    });
 
    // 초기화
    displayUserInfo();
    loadPostData();
 });