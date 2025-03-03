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
    const commentForm = document.querySelector('.comment-form');
    const commentTextarea = commentForm.querySelector('textarea');
    const commentSubmitBtn = document.querySelector('.submit-btn');
    const commentList = document.querySelector('.comment-list');

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
 
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
 
        // 좋아요 버튼 및 기능 추가
        const likesStat = document.querySelectorAll('.stat-value')[0];
        const likesBox = likesStat.closest('.stat-box');
        
        // 좋아요 박스를 클릭 가능하게 스타일 변경
        likesBox.style.cursor = 'pointer';
        
        // 현재 사용자가 이미 좋아요를 눌렀는지 확인
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userEmail = currentUser.email;
        
        // post에 likedBy 배열이 없으면 생성
        if (!post.likedBy) {
            post.likedBy = [];
        }
        
        // 좋아요 상태에 따라 스타일 변경
        if (post.likedBy.includes(userEmail)) {
            likesBox.style.backgroundColor = '#7C6CF6';
            likesBox.style.color = 'white';
        }
        
        // 좋아요 클릭 이벤트
        likesBox.addEventListener('click', function() {
            const userIndex = post.likedBy.indexOf(userEmail);
            
            if (userIndex === -1) {
                // 좋아요 추가
                post.likedBy.push(userEmail);
                post.likes += 1;
                likesBox.style.backgroundColor = '#7C6CF6';
                likesBox.style.color = 'white';
            } else {
                // 좋아요 취소
                post.likedBy.splice(userIndex, 1);
                post.likes -= 1;
                likesBox.style.backgroundColor = '#f5f5f5';
                likesBox.style.color = '#333';
            }
            
            // 좋아요 수 업데이트
            likesStat.textContent = post.likes;
            
            // localStorage 업데이트
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            const postIndex = posts.findIndex(p => p.id === Number(postId));
            posts[postIndex] = post;
            localStorage.setItem('posts', JSON.stringify(posts));
        });
 
        // 수정/삭제 버튼 표시 (작성자만)
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
 
    // 댓글 로드 함수
    function loadComments() {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const post = posts.find(p => p.id === Number(postId));
        
        if (!post) return;
        
        // 댓글 목록 초기화
        commentList.innerHTML = '';
        
        // 댓글 배열이 없으면 생성
        if (!post.commentsList) {
            post.commentsList = [];
        }
        
        // 현재 로그인한 사용자 정보
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 댓글 출력
        post.commentsList.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.dataset.commentId = comment.id;
            
            // 현재 사용자가 작성한 댓글인지 확인
            const isAuthor = currentUser.nickname === comment.author;
            
            // 댓글 작성자와 현재 사용자가 같은 경우에만 수정/삭제 버튼 표시
            const actionButtons = isAuthor ? `
                <div class="comment-actions">
                    <button class="comment-edit-btn">수정</button>
                    <button class="comment-delete-btn">삭제</button>
                </div>
            ` : '';
            
            commentElement.innerHTML = `
                <div class="comment-author">
                    <img src="${comment.authorImage || '../images/default-profile.png'}" class="comment-author-image">
                    <div class="comment-info">
                        <span class="comment-author-name">${comment.author}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    ${actionButtons}
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-edit-form" style="display: none;">
                    <textarea class="edit-textarea">${comment.text}</textarea>
                    <div class="edit-buttons">
                        <button class="save-edit-btn">저장</button>
                        <button class="cancel-edit-btn">취소</button>
                    </div>
                </div>
            `;
            
            commentList.appendChild(commentElement);
            
            // 수정/삭제 버튼 이벤트 추가 (작성자인 경우만)
            if (isAuthor) {
                const editBtn = commentElement.querySelector('.comment-edit-btn');
                const deleteBtn = commentElement.querySelector('.comment-delete-btn');
                const commentText = commentElement.querySelector('.comment-text');
                const editForm = commentElement.querySelector('.comment-edit-form');
                const editTextarea = commentElement.querySelector('.edit-textarea');
                const saveBtn = commentElement.querySelector('.save-edit-btn');
                const cancelBtn = commentElement.querySelector('.cancel-edit-btn');
                
                // 수정 버튼 클릭 시
                editBtn.addEventListener('click', function() {
                    commentText.style.display = 'none';
                    editForm.style.display = 'block';
                    editTextarea.focus();
                });
                
                // 취소 버튼 클릭 시
                cancelBtn.addEventListener('click', function() {
                    commentText.style.display = 'block';
                    editForm.style.display = 'none';
                    editTextarea.value = comment.text; // 원래 텍스트로 복원
                });
                
                // 저장 버튼 클릭 시
                saveBtn.addEventListener('click', function() {
                    const newText = editTextarea.value.trim();
                    if (!newText) {
                        alert('댓글 내용을 입력해주세요.');
                        return;
                    }
                    
                    // 댓글 수정 처리
                    updateComment(comment.id, newText);
                    
                    // UI 업데이트
                    commentText.textContent = newText;
                    commentText.style.display = 'block';
                    editForm.style.display = 'none';
                });
                
                // 삭제 버튼 클릭 시
                deleteBtn.addEventListener('click', function() {
                    if (confirm('댓글을 삭제하시겠습니까?')) {
                        deleteComment(comment.id);
                    }
                });
            }
        });
        
        // 댓글 수 업데이트
        const commentStat = document.querySelectorAll('.stat-value')[2];
        commentStat.textContent = post.commentsList.length;
    }
    
    // 댓글 수정 함수
    function updateComment(commentId, newText) {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === Number(postId));
        
        if (postIndex === -1) return;
        
        const commentIndex = posts[postIndex].commentsList.findIndex(c => c.id === commentId);
        
        if (commentIndex === -1) return;
        
        // 댓글 내용 업데이트
        posts[postIndex].commentsList[commentIndex].text = newText;
        posts[postIndex].commentsList[commentIndex].modifiedAt = new Date().toISOString();
        
        // localStorage 업데이트
        localStorage.setItem('posts', JSON.stringify(posts));
        
        alert('댓글이 수정되었습니다.');
    }
    
    // 댓글 삭제 함수
    function deleteComment(commentId) {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === Number(postId));
        
        if (postIndex === -1) return;
        
        // 댓글 삭제
        posts[postIndex].commentsList = posts[postIndex].commentsList.filter(c => c.id !== commentId);
        
        // 댓글 수 업데이트
        posts[postIndex].comments = posts[postIndex].commentsList.length;
        
        // localStorage 업데이트
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // 댓글 목록 다시 로드
        loadComments();
        
        alert('댓글이 삭제되었습니다.');
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

    // 댓글 등록 버튼 클릭 이벤트
    commentSubmitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const commentText = commentTextarea.value.trim();
        if (!commentText) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === Number(postId));
        
        if (postIndex === -1) return;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 댓글 객체 생성
        const newComment = {
            id: Date.now(),
            text: commentText,
            author: currentUser.nickname,
            authorImage: currentUser.profileImage,
            createdAt: new Date().toISOString()
        };
        
        // 댓글 배열이 없으면 생성
        if (!posts[postIndex].commentsList) {
            posts[postIndex].commentsList = [];
        }
        
        // 댓글 추가
        posts[postIndex].commentsList.push(newComment);
        posts[postIndex].comments = posts[postIndex].commentsList.length;
        
        // localStorage 업데이트
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // 댓글 입력창 비우기
        commentTextarea.value = '';
        
        // 댓글 목록 새로고침
        loadComments();
    });
 
    // 초기화
    displayUserInfo();
    loadPostData();
    loadComments();
 });