document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수 선언
    let isLiked = false;

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

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        alert('유효하지 않은 게시글입니다.');
        window.location.href = '../index/index.html';
        return;
    }

    // DOM 요소 선택
    const postTitle = document.querySelector('.post-title');
    const authorName = document.querySelector('.author-name');
    const authorImage = document.querySelector('.author-image');
    const postDate = document.querySelector('.post-date');
    const postImage = document.querySelector('.post-image');
    const postText = document.querySelector('.post-text');
    const likesValue = document.querySelector('.stat-box:nth-child(1) .stat-value');
    const viewsValue = document.querySelector('.stat-box:nth-child(2) .stat-value');
    const commentsValue = document.querySelector('.stat-box:nth-child(3) .stat-value');
    const actionBtns = document.querySelectorAll('.action-btn');
    const commentForm = document.querySelector('.comment-form');
    const commentTextarea = document.querySelector('.comment-form textarea');
    const commentList = document.querySelector('.comment-list');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    const backBtn = document.querySelector('.back-btn');
    const likeBox = document.querySelector('.stat-box:nth-child(1)');
    
    // API URL (실제 환경에서는 실제 API 엔드포인트로 대체)
    const API_URL = 'http://localhost:8080/api';
    
    // 현재 로그인한 사용자와 게시글 데이터
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let postData = null;

    // 사용자 정보 표시
    function displayUserInfo() {
        if (currentUser && currentUser.profileImage) {
            profileDropdown.src = currentUser.profileImage;
        }
    }

    // 게시글 좋아요 정보를 로컬 스토리지에서 가져오기
    function getPostLikeInfo(postId) {
    try {
        // 모든 게시글의 좋아요 정보
        const postsLikeInfo = JSON.parse(localStorage.getItem('postsLikeInfo') || '{}');
        
        // 이 게시글의 좋아요 정보 (없으면 기본값 설정)
        if (!postsLikeInfo[postId]) {
            postsLikeInfo[postId] = {
                count: 0,
                userLiked: {} // 사용자별 좋아요 상태
            };
        }
        
        return postsLikeInfo;
    } catch (error) {
        console.error('좋아요 정보 로드 중 오류:', error);
        return {};
    }
    }

// 게시글 좋아요 정보 저장
function savePostLikeInfo(postsLikeInfo) {
    try {
        localStorage.setItem('postsLikeInfo', JSON.stringify(postsLikeInfo));
    } catch (error) {
        console.error('좋아요 정보 저장 중 오류:', error);
    }
}
    
    // 좋아요 상태 확인 함수
    async function checkLikeStatus() {
    try {
        const token = sessionStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/posts/${postId}/likes/check`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        isLiked = data.liked || false;
        
        // 좋아요 버튼 상태 업데이트
        updateLikeButtonUI();
    } catch (error) {
        console.error('좋아요 상태 확인 중 오류:', error);
        
        // 로컬 스토리지에서 좋아요 정보 확인
        try {
            const postsLikeInfo = getPostLikeInfo(postId);
            const userId = currentUser.id;
            
            // 이 사용자의 좋아요 상태 확인
            isLiked = postsLikeInfo[postId]?.userLiked[userId] || false;
            
            // 좋아요 수도 동기화 (페이지 로드 시에만)
            if (postsLikeInfo[postId] && likesValue) {
                likesValue.textContent = postsLikeInfo[postId].count;
                if (postData) {
                    postData.likes = postsLikeInfo[postId].count;
                }
            }
            
            console.log('로컬 스토리지에서 불러온 좋아요 상태:', isLiked);
            updateLikeButtonUI();
        } catch (localError) {
            console.error('로컬 좋아요 상태 확인 중 오류:', localError);
            isLiked = false;
            updateLikeButtonUI();
        }
    }
    }

    // 좋아요 버튼 UI 업데이트
    function updateLikeButtonUI() {
        if (isLiked) {
            likeBox.classList.add('liked');
        } else {
            likeBox.classList.remove('liked');
        }
    }

    // 좋아요 토글 함수
    async function toggleLike() {
    try {
        const token = sessionStorage.getItem('token');
        const method = isLiked ? 'DELETE' : 'POST';
        
        const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // 로컬 스토리지 업데이트 및 UI 갱신
        updateLikeStatusAndUI(!isLiked);
        
    } catch (error) {
        console.error('좋아요 토글 중 오류:', error);
        
        // API 호출 실패 시에도 로컬 스토리지 업데이트 및 UI 갱신
        updateLikeStatusAndUI(!isLiked);
    }
    }

// 좋아요 상태 업데이트 및 UI 갱신 함수
function updateLikeStatusAndUI(newLikedState) {
    const userId = currentUser.id;
    
    // 로컬 스토리지에서 정보 가져오기
    const postsLikeInfo = getPostLikeInfo(postId);
    
    // 기존 상태
    const oldLikedState = postsLikeInfo[postId]?.userLiked[userId] || false;
    
    // 좋아요 수 계산
    let likeCount = postsLikeInfo[postId]?.count || 0;
    
    // 상태가 변경된 경우에만 카운트 변경
    if (oldLikedState !== newLikedState) {
        likeCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1);
    }
    
    // 정보 업데이트
    if (!postsLikeInfo[postId]) {
        postsLikeInfo[postId] = {
            count: likeCount,
            userLiked: {}
        };
    } else {
        postsLikeInfo[postId].count = likeCount;
    }
    
    // 사용자 좋아요 상태 업데이트
    postsLikeInfo[postId].userLiked[userId] = newLikedState;
    
    // 로컬 스토리지 저장
    savePostLikeInfo(postsLikeInfo);
    
    // 전역 변수 업데이트
    isLiked = newLikedState;
    
    // UI 업데이트
    likesValue.textContent = likeCount;
    if (postData) {
        postData.likes = likeCount;
    }
    
    updateLikeButtonUI();
    
    console.log('좋아요 상태 업데이트:', {
        postId: postId,
        userId: userId,
        liked: newLikedState,
        count: likeCount
    });
}

    // 좋아요 상태를 로컬 스토리지에 저장
    function saveLikeStatusToLocalStorage() {
    try {
        // 사용자별 좋아요 목록 가져오기
        const userId = currentUser.id;
        const userLikesKey = `userLikes_${userId}`;
        let userLikes = JSON.parse(localStorage.getItem(userLikesKey) || '{}');
        
        // 현재 게시글의 좋아요 상태 업데이트
        userLikes[postId] = isLiked;
        
        // 로컬 스토리지에 저장
        localStorage.setItem(userLikesKey, JSON.stringify(userLikes));
        
        // 전체 좋아요 목록 업데이트 (이전 방식과의 호환성 유지)
        let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        
        if (isLiked) {
            // 좋아요한 경우 목록에 추가 (중복 방지)
            if (!likedPosts.includes(parseInt(postId))) {
                likedPosts.push(parseInt(postId));
            }
        } else {
            // 좋아요 취소한 경우 목록에서 제거
            likedPosts = likedPosts.filter(id => id !== parseInt(postId));
        }
        
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        
        console.log('좋아요 상태 저장됨:', userLikes);
    } catch (error) {
        console.error('좋아요 상태 저장 중 오류:', error);
    }
    }
    // 게시글 정보 가져오기
    async function fetchPostData() {
        try {
            console.log('게시글 데이터 요청 - ID:', postId);
            
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('게시글 API 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('게시글 API 원본 응답 데이터:', responseData);
            
            // API 응답 구조 확인 및 처리
            let postData;
            
            if (responseData.success && responseData.data) {
                // { success: true, message: "...", data: { ... 게시글 데이터 ... } }
                postData = responseData.data;
            } else if (responseData.data) {
                // { data: { ... 게시글 데이터 ... } }
                postData = responseData.data;
            } else if (responseData.post) {
                // { post: { ... 게시글 데이터 ... } }
                postData = responseData.post;
            } else if (responseData.postId || responseData.id) {
                // 직접 게시글 객체인 경우
                postData = responseData;
            } else {
                console.error('게시글 데이터를 찾을 수 없습니다:', responseData);
                throw new Error('게시글 데이터 구조 오류');
            }
            
            console.log('처리된 게시글 데이터:', postData);
            
            displayPost(postData);
            fetchComments();
        } catch (error) {
            console.error('게시글 데이터 로드 중 오류:', error);
            
            // API 호출 실패 시 localStorage 데이터 사용
            try {
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                const localPost = posts.find(p => p.id == postId);
                
                if (!localPost) {
                    alert('게시글을 찾을 수 없습니다.');
                    window.location.href = '../index/index.html';
                    return;
                }
                
                console.log('로컬 저장소에서 불러온 게시글:', localPost);
                postData = localPost;
                displayPost(localPost);
                
                // 로컬 댓글 데이터도 가져오기
                const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                displayComments(localComments);
            } catch (localError) {
                console.error('게시글 데이터 로컬 로드 중 오류:', localError);
                alert('게시글 데이터를 불러오는 중 오류가 발생했습니다.');
                window.location.href = '../index/index.html';
            }
        }
    }

    // 게시글 정보 표시
    function displayPost(post) {
        console.log('표시할 게시글 데이터:', post);
        
        if (!post) {
            console.error('게시글 데이터가 없습니다.');
            alert('게시글 데이터를 불러올 수 없습니다.');
            window.location.href = '../index/index.html';
            return;
        }
        
        postTitle.textContent = post.title || '제목 없음';
        authorName.textContent = post.authorNickname || post.author || '익명';
        postDate.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
        postText.textContent = post.content || '내용 없음';
        
        if (post.authorProfileImage || post.authorImage) {
            authorImage.src = post.authorProfileImage || post.authorImage;
        } else {
            authorImage.src = '/images/default-profile.png';
        }
        
        if (post.postImage || post.image) {
            postImage.innerHTML = `<img src="${post.postImage || post.image}" alt="게시글 이미지">`;
        } else {
            postImage.innerHTML = '';
        }
        
        likesValue.textContent = post.likes || 0;
        viewsValue.textContent = post.views || 0;
        commentsValue.textContent = post.comments || 0;
        
        // 현재 사용자가 작성자인 경우에만 수정/삭제 버튼 표시
        const isAuthor = currentUser && 
                        (post.userId === currentUser.id || 
                         post.authorId === currentUser.id || 
                         post.author === currentUser.nickname);
        
        if (actionBtns && actionBtns.length >= 2) {
            const editBtn = actionBtns[0];
            const deleteBtn = actionBtns[1];
            
            editBtn.style.display = isAuthor ? 'inline-block' : 'none';
            deleteBtn.style.display = isAuthor ? 'inline-block' : 'none';
            
            // 수정 버튼 클릭 이벤트 
            editBtn.addEventListener('click', function() {
                window.location.href = `../edit/edit.html?id=${postId}`;
            });
            
            // 삭제 버튼 클릭 이벤트
            deleteBtn.addEventListener('click', function() {
                deletePost();
            });
        }
        
        // 좋아요 수 설정 전에 로컬 스토리지 확인
        const postsLikeInfo = getPostLikeInfo(postId);
        
        // 로컬 스토리지에 저장된 좋아요 수가 있으면 그것을 우선 사용
        if (postsLikeInfo[postId] && postsLikeInfo[postId].count !== undefined) {
            likesValue.textContent = postsLikeInfo[postId].count;
            // post 객체에도 업데이트
            post.likes = postsLikeInfo[postId].count;
        } else {
            likesValue.textContent = post.likes || 0;
        }
    }

    // 댓글 목록 가져오기
    async function fetchComments() {
        try {
            console.log('댓글 목록 가져오기 요청 - 게시글 ID:', postId);
            
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('댓글 API 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('댓글 API 응답 데이터:', responseData);
            
            // 댓글 배열 추출
            let comments = [];
            if (Array.isArray(responseData)) {
                comments = responseData;
            } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
                comments = responseData.data;
            } else if (responseData && typeof responseData === 'object') {
                for (const key in responseData) {
                    if (Array.isArray(responseData[key])) {
                        comments = responseData[key];
                        break;
                    }
                }
            }
            
            // 댓글 수 업데이트 - 이 부분이 중요합니다!
            if (comments && Array.isArray(comments)) {
                commentsValue.textContent = comments.length;
                // postData가 있다면 여기도 업데이트
                if (postData) {
                    postData.comments = comments.length;
                }
            }
            
            // 응답 구조에 따라 다른 처리
            displayComments(responseData);
        } catch (error) {
            console.error('댓글 데이터 로드 중 오류:', error);
            
            // 오류 발생 시 빈 배열 전달
            displayComments([]);
            
            // API 호출 실패 시 localStorage 데이터 사용 (필요 시)
            try {
                const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                if (localComments.length > 0) {
                    console.log('로컬 스토리지 댓글 데이터 사용:', localComments);
                    displayComments(localComments);
                    // 댓글 수 업데이트
                    commentsValue.textContent = localComments.length;
                    if (postData) {
                        postData.comments = localComments.length;
                    }
                }
            } catch (localError) {
                console.error('로컬 스토리지 댓글 데이터 로드 중 오류:', localError);
            }
        }
    }

    // 댓글 목록 표시
    function displayComments(commentsData) {
        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = ''; // 기존 목록 초기화
        
        console.log('댓글 데이터:', commentsData);
        
        // 댓글 데이터 구조 확인 및 배열 추출
        let comments = [];
        
        if (Array.isArray(commentsData)) {
            comments = commentsData;
        } else if (commentsData && commentsData.data && Array.isArray(commentsData.data)) {
            // API 응답 구조: { success: true, data: [...댓글 배열] }
            comments = commentsData.data;
        } else if (commentsData && typeof commentsData === 'object') {
            // 다른 형태의 응답인 경우
            console.log('댓글 데이터 필드:', Object.keys(commentsData));
            // 가능한 배열 필드 찾기
            for (const key in commentsData) {
                if (Array.isArray(commentsData[key])) {
                    console.log(`배열 필드 발견: ${key}`);
                    comments = commentsData[key];
                    break;
                }
            }
        }
        
        // 댓글 수 표시 업데이트
        commentsValue.textContent = comments.length;
        
        // 배열이 아니거나 비어있는 경우 처리
        if (!Array.isArray(comments)) {
            console.error('댓글 데이터 형식 오류:', commentsData);
            commentList.innerHTML = '<div class="no-comments">댓글 데이터를 불러올 수 없습니다.</div>';
            return;
        }
        
        if (comments.length === 0) {
            commentList.innerHTML = '<div class="no-comments">댓글이 없습니다. 첫 댓글을 작성해보세요!</div>';
            return;
        }
        
        // 현재 로그인한 사용자 정보
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // 댓글 목록 표시
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.dataset.commentId = comment.commentId;
            
            // 사용자가 댓글 작성자인지 확인
            const isCommentAuthor = currentUser && 
                (comment.userId === currentUser.id || 
                 comment.authorId === currentUser.id || 
                 comment.author === currentUser.nickname);
            
            commentItem.innerHTML = `
                <div class="comment-author">
                    <img src="${comment.authorProfileImage || comment.authorImage || '../images/default-profile.png'}" alt="프로필" class="comment-author-image">
                    <div class="comment-info">
                        <span class="comment-author-name">${comment.authorNickname || comment.author || '익명'}</span>
                        <span class="comment-date">${new Date(comment.commentAt || comment.createdAt).toLocaleString()}</span>
                    </div>
                    ${isCommentAuthor ? `
                    <div class="comment-actions">
                        <button class="comment-edit-btn">수정</button>
                        <button class="comment-delete-btn">삭제</button>
                    </div>
                    ` : ''}
                </div>
                <div class="comment-text">${comment.content}</div>
                ${isCommentAuthor ? `
                <div class="comment-edit-form" style="display: none;">
                    <textarea class="edit-textarea">${comment.content}</textarea>
                    <div class="edit-buttons">
                        <button class="save-edit-btn">저장</button>
                        <button class="cancel-edit-btn">취소</button>
                    </div>
                </div>
                ` : ''}
            `;
            
            commentList.appendChild(commentItem);
            
            // 댓글 수정 등 관련 이벤트 리스너 추가
            if (isCommentAuthor) {
                const editBtn = commentItem.querySelector('.comment-edit-btn');
                const deleteBtn = commentItem.querySelector('.comment-delete-btn');
                const editForm = commentItem.querySelector('.comment-edit-form');
                const commentTextEl = commentItem.querySelector('.comment-text');
                const editTextarea = commentItem.querySelector('.edit-textarea');
                const saveEditBtn = commentItem.querySelector('.save-edit-btn');
                const cancelEditBtn = commentItem.querySelector('.cancel-edit-btn');
                
                // 수정 버튼 클릭 이벤트
                editBtn.addEventListener('click', function() {
                    commentTextEl.style.display = 'none';
                    editForm.style.display = 'block';
                    editTextarea.focus();
                });
                
                // 취소 버튼 클릭 이벤트
                cancelEditBtn.addEventListener('click', function() {
                    commentTextEl.style.display = 'block';
                    editForm.style.display = 'none';
                    editTextarea.value = comment.content;
                });
                
                // 저장 버튼 클릭 이벤트
                saveEditBtn.addEventListener('click', function() {
                    updateComment(comment.commentId, editTextarea.value);
                });
                
                // 삭제 버튼 클릭 이벤트
                deleteBtn.addEventListener('click', function() {
                    if (confirm('댓글을 삭제하시겠습니까?')) {
                        deleteComment(comment.commentId);
                    }
                });
            }
        });
    }

    // 댓글 추가
    async function addComment(content) {
        // 백엔드가 기대하는 형식으로 변경
        const newComment = {
            content: content
            // 백엔드가 userId와 postId를 토큰과 URL에서 추출하므로 여기서는 필요 없음
        };
        
        try {
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newComment)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 댓글 목록 다시 불러오기
            fetchComments();
            
            // 직접 댓글 수 +1 업데이트 - fetchComments가 실패할 경우 대비
            const currentCount = parseInt(commentsValue.textContent || '0');
            commentsValue.textContent = currentCount + 1;
            
            if (postData) {
                postData.comments = (postData.comments || 0) + 1;
            }
        } catch (error) {
            console.error('댓글 추가 중 오류:', error);
            
            // API 호출 실패 시 localStorage에 직접 저장
            try {
                // 로컬 저장용 객체 - API와 형식이 다름
                const localComment = {
                    id: Date.now(),
                    content: content,
                    postId: postId,
                    author: currentUser.nickname,
                    authorId: currentUser.id,
                    authorImage: currentUser.profileImage,
                    createdAt: new Date().toISOString()
                };
                
                let comments = [];
                try {
                    comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                } catch (error) {
                    console.error('기존 댓글 데이터 파싱 오류:', error);
                    comments = [];
                }
                
                // 새 댓글 추가
                comments.push(localComment);
                
                // localStorage에 저장
                localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
                
                // 댓글 목록 업데이트
                displayComments(comments);
                
                // 게시글 댓글 수 증가
                if (postData) {
                    postData.comments = (postData.comments || 0) + 1;
                    commentsValue.textContent = postData.comments;
                    
                    // posts 배열에서 해당 게시글 업데이트
                    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                    const postIndex = posts.findIndex(p => p.id == postId);
                    if (postIndex > -1) {
                        posts[postIndex].comments = postData.comments;
                        localStorage.setItem('posts', JSON.stringify(posts));
                    }
                }
            } catch (localError) {
                console.error('localStorage 저장 중 오류:', localError);
                alert('댓글 저장에 실패했습니다.');
            }
        }
    }

    // 댓글 수정
    async function updateComment(commentId, content) {
        try {
            const token = sessionStorage.getItem('token');
            
            // 백엔드가 기대하는 형식대로 수정
            const updateData = {
                content: content
            };
            
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 댓글 목록 다시 불러오기
            fetchComments();
        } catch (error) {
            console.error('댓글 수정 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 업데이트
            try {
                const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                const commentIndex = comments.findIndex(c => c.id == commentId);
                
                if (commentIndex > -1) {
                    comments[commentIndex].content = content;
                    comments[commentIndex].updatedAt = new Date().toISOString();
                    
                    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
                    displayComments(comments);
                }
            } catch (localError) {
                console.error('localStorage 업데이트 중 오류:', localError);
                alert('댓글 수정에 실패했습니다.');
            }
        }
    }

    // 댓글 삭제
    async function deleteComment(commentId) {
        if (!confirm('댓글을 삭제하시겠습니까?')) {
            return;
        }
        
        try {
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 댓글 목록 다시 불러오기
            fetchComments();
            
            // 게시글 댓글 수 감소
            if (postData && postData.comments > 0) {
                postData.comments--;
                commentsValue.textContent = postData.comments;
            }
        } catch (error) {
            console.error('댓글 삭제 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 삭제
            try {
                const comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                const updatedComments = comments.filter(c => c.id != commentId);
                
                localStorage.setItem(`comments_${postId}`, JSON.stringify(updatedComments));
                
                // 댓글 목록 업데이트
                displayComments(updatedComments);
                
                // 게시글 댓글 수 감소
                if (postData && postData.comments > 0) {
                    postData.comments--;
                    commentsValue.textContent = postData.comments;
                    
                    // posts 배열에서 해당 게시글 업데이트
                    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                    const postIndex = posts.findIndex(p => p.id == postId);
                    if (postIndex > -1) {
                        posts[postIndex].comments = postData.comments;
                        localStorage.setItem('posts', JSON.stringify(posts));
                    }
                }
            } catch (localError) {
                console.error('localStorage 업데이트 중 오류:', localError);
                alert('댓글 삭제에 실패했습니다.');
            }
        }
    }

    // 게시글 삭제
    async function deletePost() {
        if (!confirm('게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }
        
        try {
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            alert('게시글이 삭제되었습니다.');
            window.location.href = '../index/index.html';
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 삭제
            try {
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                const updatedPosts = posts.filter(p => p.id != postId);
                
                localStorage.setItem('posts', JSON.stringify(updatedPosts));
                
                // 댓글도 삭제
                localStorage.removeItem(`comments_${postId}`);
                
                alert('게시글이 삭제되었습니다.');
                window.location.href = '../index/index.html';
            } catch (localError) {
                console.error('localStorage 업데이트 중 오류:', localError);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    }

    // 좋아요 박스에 이벤트 리스너 추가
    likeBox.addEventListener('click', toggleLike);
    likeBox.style.cursor = 'pointer';

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
                sessionStorage.removeItem('token');
                window.location.href = '../../auth/login/login.html';
                break;
        }
    });

    // 댓글 폼 제출 이벤트
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentContent = commentTextarea.value.trim();
            if (!commentContent) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }
            
            addComment(commentContent);
            commentTextarea.value = '';
        });
    }

    // 댓글 등록 버튼 클릭 이벤트
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const commentContent = commentTextarea.value.trim();
            if (!commentContent) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }
            
            addComment(commentContent);
            commentTextarea.value = '';
        });
    }

    // 뒤로가기 버튼 이벤트
    backBtn.addEventListener('click', function() {
        window.location.href = '../index/index.html';
    });

    // 초기화
    displayUserInfo();
    checkLikeStatus(); // 좋아요 상태 확인
    fetchPostData();
});