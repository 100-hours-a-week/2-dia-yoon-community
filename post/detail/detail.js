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

    // 게시글 정보 가져오기
    async function fetchPostData() {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            postData = await response.json();
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
        postTitle.textContent = post.title || '';
        authorName.textContent = post.author || '익명';
        postDate.textContent = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
        postText.textContent = post.content || '';
        
        if (post.authorImage) {
            authorImage.src = post.authorImage;
        } else {
            authorImage.src = '../images/default-profile.png';
        }
        
        if (post.image) {
            postImage.innerHTML = `<img src="${post.image}" alt="게시글 이미지">`;
        } else {
            postImage.innerHTML = '';
        }
        
        likesValue.textContent = post.likes || 0;
        viewsValue.textContent = post.views || 0;
        commentsValue.textContent = post.comments || 0;
        
        // 현재 사용자가 작성자인 경우에만 수정/삭제 버튼 표시
        const isAuthor = currentUser && 
                        (post.authorId === currentUser.id || post.author === currentUser.nickname);
        
        if (actionBtns && actionBtns.length >= 2) {
            const editBtn = actionBtns[0];
            const deleteBtn = actionBtns[1];
            
            editBtn.style.display = isAuthor ? 'inline-block' : 'none';
            deleteBtn.style.display = isAuthor ? 'inline-block' : 'none';
            
            // 수정 버튼 클릭 이벤트
            editBtn.addEventListener('click', function() {
                window.location.href = `../modify/modify.html?id=${postId}`;
            });
            
            // 삭제 버튼 클릭 이벤트
            deleteBtn.addEventListener('click', function() {
                deletePost();
            });
        }
    }

    // 댓글 목록 가져오기
    async function fetchComments() {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('댓글 데이터 로드 중 오류:', error);
            
            // API 호출 실패 시 localStorage 데이터 사용
            const localComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            displayComments(localComments);
        }
    }

    // 댓글 목록 표시
    function displayComments(comments) {
        commentList.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            commentList.innerHTML = '<p>등록된 댓글이 없습니다.</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.dataset.commentId = comment.id;
            
            const isCommentAuthor = currentUser && 
                                  (comment.authorId === currentUser.id || comment.author === currentUser.nickname);
            
            commentItem.innerHTML = `
                <div class="comment-author">
                    <img src="${comment.authorImage || '../images/default-profile.png'}" alt="프로필" class="comment-author-image">
                    <div class="comment-info">
                        <span class="comment-author-name">${comment.author || '익명'}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
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
                <div class="comment-edit-form">
                    <textarea class="edit-textarea">${comment.content}</textarea>
                    <div class="edit-buttons">
                        <button class="save-edit-btn">저장</button>
                        <button class="cancel-edit-btn">취소</button>
                    </div>
                </div>
                ` : ''}
            `;
            
            commentList.appendChild(commentItem);
            
            // 댓글 수정 폼 관련 이벤트 리스너 추가
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
                    editForm.style.display = 'block';
                    commentTextEl.style.display = 'none';
                });
                
                // 취소 버튼 클릭 이벤트
                cancelEditBtn.addEventListener('click', function() {
                    editForm.style.display = 'none';
                    commentTextEl.style.display = 'block';
                });
                
                // 저장 버튼 클릭 이벤트
                saveEditBtn.addEventListener('click', function() {
                    updateComment(comment.id, editTextarea.value.trim());
                });
                
                // 삭제 버튼 클릭 이벤트
                deleteBtn.addEventListener('click', function() {
                    deleteComment(comment.id);
                });
            }
        });
    }

    // 댓글 추가
    async function addComment(content) {
        const newComment = {
            content: content,
            postId: postId,
            author: currentUser.nickname,
            authorId: currentUser.id,
            authorImage: currentUser.profileImage,
            createdAt: new Date().toISOString()
        };
        
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newComment)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 댓글 목록 다시 불러오기
            fetchComments();
            
            // 게시글 댓글 수 증가
            if (postData) {
                postData.comments = (postData.comments || 0) + 1;
                commentsValue.textContent = postData.comments;
            }
        } catch (error) {
            console.error('댓글 추가 중 오류:', error);
            
            // API 호출 실패 시 localStorage에 직접 저장
            try {
                // ID 생성 (시간을 이용하여 유니크한 ID 생성)
                newComment.id = Date.now();
                
                let comments = [];
                try {
                    comments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                } catch (error) {
                    console.error('기존 댓글 데이터 파싱 오류:', error);
                    comments = [];
                }
                
                // 새 댓글 추가
                comments.push(newComment);
                
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
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
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
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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

    // 뒤로가기 버튼 이벤트
    backBtn.addEventListener('click', function() {
        window.location.href = '../index/index.html';
    });

    // 초기화
    displayUserInfo();
    fetchPostData();
});