// detail.js
document.addEventListener('DOMContentLoaded', function() {
    // 요소 선택
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    const backButton = document.querySelector('.back-btn');
    const postActionButtons = document.querySelectorAll('.post-actions .action-btn');
    const deleteModal = document.getElementById('deleteModal');
    const deleteCommentModal = document.getElementById('deleteCommentModal');
    const commentForm = document.getElementById('commentForm');
    const commentInput = document.getElementById('commentInput');
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');
    const commentList = document.querySelector('.comment-list');

    let editingCommentId = null;

    // 뒤로가기
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // 게시글 수정/삭제
    postActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.textContent === '수정') {
                window.location.href = 'modify.html';
            } else if (this.textContent === '삭제') {
                deleteModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 댓글 입력 처리
    commentInput.addEventListener('input', function() {
        if (this.value.trim()) {
            commentSubmitBtn.classList.remove('disabled');
            commentSubmitBtn.style.backgroundColor = '#7F6AEE';
        } else {
            commentSubmitBtn.classList.add('disabled');
            commentSubmitBtn.style.backgroundColor = '#ACA0EB';
        }
    });

    // 댓글 등록/수정
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = commentInput.value.trim();
        
        if (!text) return;

        if (editingCommentId) {
            // 댓글 수정 처리
            const commentElement = document.querySelector(`[data-comment-id="${editingCommentId}"]`);
            const commentTextElement = commentElement.querySelector('.comment-text');
            commentTextElement.textContent = text;
            
            editingCommentId = null;
            commentSubmitBtn.textContent = '댓글 등록';
            commentElement.classList.remove('editing');
        } else {
            // 새 댓글 추가
            const newComment = createCommentElement({
                id: Date.now(),
                text: text,
                author: '데이 작성자 1',
                date: new Date().toISOString()
            });
            commentList.appendChild(newComment);
        }

        // 폼 초기화
        commentInput.value = '';
        commentSubmitBtn.classList.add('disabled');
        commentSubmitBtn.style.backgroundColor = '#ACA0EB';
    });

    // 댓글 요소 생성
    function createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.dataset.commentId = comment.id;
        
        div.innerHTML = `
            <div class="comment-author">
                <img src="../images/default-profile.png" alt="댓글 작성자" class="comment-author-image">
                <span class="comment-author-name">${comment.author}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
            <div class="comment-actions">
                <button class="action-btn edit-btn">수정</button>
                <button class="action-btn delete-btn">삭제</button>
            </div>
        `;

        // 수정 버튼
        div.querySelector('.edit-btn').addEventListener('click', function() {
            editingCommentId = comment.id;
            commentInput.value = comment.text;
            commentSubmitBtn.textContent = '댓글 수정';
            commentSubmitBtn.classList.remove('disabled');
            commentSubmitBtn.style.backgroundColor = '#7F6AEE';
            div.classList.add('editing');
            commentInput.focus();
        });

        // 삭제 버튼
        div.querySelector('.delete-btn').addEventListener('click', function() {
            deleteCommentModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 삭제 확인 이벤트 설정
            const confirmDelete = function() {
                div.remove();
                deleteCommentModal.classList.remove('show');
                document.body.style.overflow = '';
                deleteCommentModal.querySelector('.confirm-btn').removeEventListener('click', confirmDelete);
            };
            
            deleteCommentModal.querySelector('.confirm-btn').addEventListener('click', confirmDelete);
        });

        return div;
    }

    // 모달 닫기 버튼들
    document.querySelectorAll('.modal-overlay .cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('show');
            document.body.style.overflow = '';
        });
    });

    // 게시글 삭제 모달 확인 버튼
    deleteModal.querySelector('.confirm-btn').addEventListener('click', function() {
        // TODO: 게시글 삭제 API 호출
        deleteModal.classList.remove('show');
        document.body.style.overflow = '';
        window.location.href = 'index.html';
    });
});