document.addEventListener('DOMContentLoaded', function() {
    // 초기 로그인 체크
    if (!window.headerUtils.checkLogin()) return;

    // 드롭다운 메뉴 관련 요소
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');

    // 게시글 좋아요 정보를 로컬 스토리지에서 가져오기
    function getPostLikeInfo() {
        try {
            // 모든 게시글의 좋아요 정보
            const postsLikeInfo = JSON.parse(localStorage.getItem('postsLikeInfo') || '{}');
            return postsLikeInfo;
        } catch (error) {
            console.error('좋아요 정보 로드 중 오류:', error);
            return {};
        }
    }

    // 게시글별 댓글 수 가져오기
    function getPostCommentCounts() {
        try {
            const commentCounts = {};
            
            // 디버깅: 모든 로컬 스토리지 키 출력
            console.log('로컬 스토리지 모든 키:');
            for (let i = 0; i < localStorage.length; i++) {
                console.log(`${i}: ${localStorage.key(i)}`);
            }
            
            // localStorage에서 모든 키 확인
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // 댓글 관련 키 찾기 (주로 comments_ 형식 검색)
                if (key && key.startsWith('comments_')) {
                    console.log('댓글 데이터 키 발견:', key);
                    
                    // postId 추출 - comments_123 -> 123
                    const postId = key.split('_')[1];
                    
                    if (postId) {
                        try {
                            const comments = JSON.parse(localStorage.getItem(key) || '[]');
                            console.log(`게시글 ID ${postId}의 댓글 수:`, comments.length);
                            commentCounts[postId] = comments.length;
                        } catch (e) {
                            console.error(`댓글 파싱 오류 (${key}):`, e);
                        }
                    }
                }
            }
            
            // detail.js에서 사용하는 다른 가능한 댓글 키 형식 검색 (하위 호환성 유지)
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // comments_ 형식이 아닌 다른 형식의 댓글 키 검색
                if (key && !key.startsWith('comments_') && key.includes('comments')) {
                    console.log('다른 형식의 댓글 키 발견:', key);
                    
                    // 숫자 패턴 추출 시도 (postId 추출)
                    const matches = key.match(/\d+/);
                    if (matches) {
                        const postId = matches[0];
                        
                        // 이미 처리된 postId가 아닌 경우에만 처리
                        if (!commentCounts[postId]) {
                            try {
                                const comments = JSON.parse(localStorage.getItem(key) || '[]');
                                console.log(`게시글 ID ${postId}의 댓글 수 (다른 형식):`, comments.length);
                                commentCounts[postId] = comments.length;
                            } catch (e) {
                                console.error(`댓글 파싱 오류 (${key}):`, e);
                            }
                        }
                    }
                }
            }
            
            console.log('게시글별 댓글 수 최종:', commentCounts);
            return commentCounts;
        } catch (error) {
            console.error('댓글 수 정보 로드 중 오류:', error);
            return {};
        }
    }

    // 게시글 목록 가져오기 함수
    async function fetchPosts() {
        try {
            // API를 통해 게시글 목록 가져오기 (페이지는 1부터 시작)
            const response = await postAPI.getPosts(1);
            console.log('API 응답:', response);
            
            // 로컬 스토리지의 좋아요 정보로 게시글 데이터 보강
            const postsLikeInfo = getPostLikeInfo();
            
            // 로컬 스토리지의 댓글 수 정보 가져오기
            const commentCounts = getPostCommentCounts();
            
            // API 응답 구조 파악
            let posts = response;
            
            // API 응답 구조 검사 (response가 API 응답 객체인 경우)
            if (!Array.isArray(response) && response !== null && typeof response === 'object') {
                // PostListResponse 구조인 경우
                if (response.posts && Array.isArray(response.posts)) {
                    posts = response.posts;
                }
                // 다른 구조인 경우 (response 자체가 응답 객체인 경우)
                else if (response.data) {
                    if (Array.isArray(response.data)) {
                        posts = response.data;
                    } else if (response.data.posts && Array.isArray(response.data.posts)) {
                        posts = response.data.posts;
                    }
                }
            }
            
            // 각 게시글의 좋아요 수와 댓글 수 업데이트
            if (Array.isArray(posts)) {
                posts.forEach(post => {
                    const postId = post.postId || post.id;
                    
                    // 좋아요 수 업데이트
                    if (postsLikeInfo[postId] && postsLikeInfo[postId].count !== undefined) {
                        post.likes = postsLikeInfo[postId].count;
                    }
                    
                    // 댓글 수 업데이트
                    if (commentCounts[postId] !== undefined) {
                        post.comments = commentCounts[postId];
                    }
                });
            }
            
            displayPosts(response); // 원본 응답 전달 (내부에서 구조 파악)
        } catch (error) {
            console.error('게시글을 불러오는 중 오류 발생:', error);
            // API 요청이 실패한 경우 대체로 localStorage 데이터 사용
            const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');
            
            // 로컬 스토리지의 좋아요 정보 적용
            const postsLikeInfo = getPostLikeInfo();
            
            // 로컬 스토리지의 댓글 수 정보 가져오기
            const commentCounts = getPostCommentCounts();
            
            localPosts.forEach(post => {
                const postId = post.postId || post.id;
                
                // 좋아요 수 업데이트
                if (postsLikeInfo[postId] && postsLikeInfo[postId].count !== undefined) {
                    post.likes = postsLikeInfo[postId].count;
                }
                
                // 댓글 수 업데이트
                if (commentCounts[postId] !== undefined) {
                    post.comments = commentCounts[postId];
                }
            });
            
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
        
        // 모든 게시글의 좋아요 정보 가져오기
        const postsLikeInfo = getPostLikeInfo();
        
        // 모든 게시글의 댓글 수 정보 가져오기
        const commentCounts = getPostCommentCounts();
        
        // 디버깅용: 모든 댓글 정보 출력
        console.log('댓글 수 정보:', commentCounts);
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            
            // ID 필드명 유연하게 처리 (id 또는 postId)
            const postId = post.postId || post.id;
            postElement.dataset.postId = postId;
            
            // 작성자 관련 필드 유연하게 처리
            const authorName = post.authorNickname || post.author || '익명';
            
            // 작성자 프로필 이미지 경로 처리
            let authorImg;
            if (post.authorProfileImage || post.authorImage) {
                const imageSource = post.authorProfileImage || post.authorImage;
                
                // Base64 이미지 데이터인 경우 직접 사용
                if (imageSource.startsWith('data:image/')) {
                    authorImg = imageSource;
                } 
                // 절대 경로인 경우 그대로 사용
                else if (imageSource.startsWith('/')) {
                    authorImg = imageSource;
                } 
                // 상대 경로나 파일명인 경우
                else {
                    authorImg = `../images/${imageSource.split('/').pop()}`;
                }
            } else {
                // 이미지 정보가 없으면 기본 이미지
                authorImg = '../../images/default-profile.jpg';
            }
            
            // 좋아요 수 로컬 스토리지 정보로 업데이트
            let likeCount = post.likes || 0;
            if (postsLikeInfo[postId] && postsLikeInfo[postId].count !== undefined) {
                likeCount = postsLikeInfo[postId].count;
            }
            
            // 댓글 수 로컬 스토리지 정보로 업데이트 (개선된 버전)
            let commentCount = post.comments || 0;
            const strPostId = String(postId); // ID를 문자열로 변환
            
            if (commentCounts[strPostId] !== undefined) {
                commentCount = commentCounts[strPostId];
                console.log(`게시글 ID ${strPostId}의 댓글 수 업데이트:`, commentCount);
            } else if (commentCounts[postId] !== undefined) {
                commentCount = commentCounts[postId];
                console.log(`게시글 ID ${postId}의 댓글 수 업데이트:`, commentCount);
            } else {
                // 로컬 스토리지에서 직접 확인
                try {
                    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                    if (comments.length > 0) {
                        commentCount = comments.length;
                        console.log(`직접 확인한 게시글 ID ${postId}의 댓글 수:`, commentCount);
                    }
                } catch (e) {
                    console.error(`댓글 확인 중 오류 (ID: ${postId}):`, e);
                }
            }
            
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-info">
                    <span>좋아요 <span class="like-count">${likeCount}</span> 댓글 <span class="comment-count">${commentCount}</span> 조회수 ${post.views || 0}</span>
                    <span class="date">${new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div class="post-author">
                    <img src="${authorImg}" alt="프로필" class="author-image" onerror="this.src='../images/default-profile.png'">
                    <span>${authorName}</span>
                </div>
            `;
            
            postList.appendChild(postElement);
        });
    }

    // 게시글 작성 버튼 이벤트
    const writeButton = document.querySelector('.write-button');
    if (writeButton) {
        writeButton.addEventListener('click', function() {
            window.location.href = '../add/add.html';
        });
    }

    // 게시글 클릭 이벤트 처리
    const postList = document.querySelector('.post-list');
    if (postList) {
        postList.addEventListener('click', function(e) {
            // 클릭된 요소가 post-item이거나 그 하위 요소인 경우
            const postItem = e.target.closest('.post-item');
            if (postItem) {
                const postId = postItem.dataset.postId;
                // 상세 페이지로 이동
                window.location.href = `../detail/detail.html?id=${postId}`;
            }
        });
    }

    // 초기화 함수
    function initialize() {
        window.headerUtils.displayUserInfo();
        fetchPosts();
    }

    // 초기화 실행
    initialize();
});