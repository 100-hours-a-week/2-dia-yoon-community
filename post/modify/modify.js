document.addEventListener('DOMContentLoaded', function() {

    // 초기 로그인 체크
    if (!window.headerUtils.checkLogin()) return;

    // 권한 체크 함수
    function checkAuthorPermission(post, user) {
        if (!post || !user) {
            console.error('게시글 또는 사용자 정보가 없습니다.');
            return false;
        }

        console.log('권한 체크 - 게시글 정보:', post);
        console.log('권한 체크 - 사용자 정보:', user);
        
        // 게시글 작성자 ID (여러 가능한 필드 확인)
        const postUserId = post.userId || post.author_id || post.authorId || post.user_id;
        
        // 게시글 작성자 이메일 (여러 가능한 필드 확인)
        const postAuthorEmail = post.authorEmail || post.email || post.userEmail || post.author_email;
        
        // 게시글 작성자 이름 (여러 가능한 필드 확인)
        const postAuthorName = post.author || post.authorName || post.author_name || post.nickname || post.username;
        
        // 현재 사용자 ID (여러 가능한 필드 확인)
        const currentUserId = user.id || user.userId || user.user_id;
        
        // 현재 사용자 이메일
        const currentUserEmail = user.email || user.userEmail;
        
        // 현재 사용자 이름 (여러 가능한 필드 확인)
        const currentUserName = user.nickname || user.username || user.name || user.author || user.authorName;
        
        console.log('권한 체크 - 게시글 작성자 ID:', postUserId, typeof postUserId);
        console.log('권한 체크 - 게시글 작성자 이메일:', postAuthorEmail);
        console.log('권한 체크 - 게시글 작성자 이름:', postAuthorName);
        console.log('권한 체크 - 현재 사용자 ID:', currentUserId, typeof currentUserId);
        console.log('권한 체크 - 현재 사용자 이메일:', currentUserEmail);
        console.log('권한 체크 - 현재 사용자 이름:', currentUserName);
        
        // ID 일치 여부 확인 (타입 변환하여 비교)
        const idMatches = postUserId && currentUserId && 
                        (postUserId.toString() === currentUserId.toString());
        
        // 이메일 일치 여부 확인 (새로 추가)
        const emailMatches = postAuthorEmail && currentUserEmail && 
                        (postAuthorEmail === currentUserEmail);
        
        // 이름 일치 여부 확인
        const nameMatches = postAuthorName && currentUserName && 
                        (postAuthorName === currentUserName);
        
        console.log('권한 체크 - ID 일치 여부:', idMatches);
        console.log('권한 체크 - 이메일 일치 여부:', emailMatches);
        console.log('권한 체크 - 이름 일치 여부:', nameMatches);
        
        // ID, 이메일, 이름 중 하나라도 일치하면 권한 있음
        const isAuthor = idMatches || emailMatches || nameMatches;
        
        // 디버깅용: 모든 값 강제 로깅
        console.log('모든 ID 값:', {
            postId: postUserId, 
            userId: currentUserId,
            postEmail: postAuthorEmail,
            userEmail: currentUserEmail,
            postName: postAuthorName,
            userName: currentUserName
        });
        
        // 테스트를 위해 항상 true 반환 (임시)
        // const isAuthor = true;
        
        console.log('권한 체크 결과:', isAuthor ? '작성자 맞음' : '작성자 아님');
        return isAuthor;
    }

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
    const backBtn = document.querySelector('.back-btn');

    // URL에서 게시글 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    // API URL (실제 환경에서는 실제 API 엔드포인트로 대체)
    const API_URL = 'http://localhost:8080/api';
    
    // 현재 게시글 데이터 저장용 변수
    let originalPost = null;
    let hasImageChanged = false;
    let newImageData = null;

    // 기존 게시글 데이터 불러오기
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
        let post;
        
        if (responseData.success && responseData.data) {
            // { success: true, message: "...", data: { ... 게시글 데이터 ... } }
            post = responseData.data;
        } else if (responseData.data) {
            // { data: { ... 게시글 데이터 ... } }
            post = responseData.data;
        } else if (responseData.post) {
            // { post: { ... 게시글 데이터 ... } }
            post = responseData.post;
        } else if (responseData.postId || responseData.id) {
            // 직접 게시글 객체인 경우
            post = responseData;
        } else {
            console.error('게시글 데이터를 찾을 수 없습니다:', responseData);
            throw new Error('게시글 데이터 구조 오류');
        }
        
        console.log('처리된 게시글 데이터:', post);
        
        // 권한 체크: 현재 사용자가 작성자인지 확인
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!checkAuthorPermission(post, currentUser)) {
            alert('이 게시글을 수정할 권한이 없습니다. 자신이 작성한 게시글만 수정할 수 있습니다.');
            window.location.href = `../detail/detail.html?id=${postId}`;
            return;
        }
        
        // 현재 게시글 데이터 저장
        originalPost = post;
        displayPostData(post);
    } catch (error) {
        console.error('게시글 데이터 로드 중 오류:', error);
        
        // API 호출 실패 시 localStorage 데이터 사용
        try {
            const posts = JSON.parse(localStorage.getItem('posts') || '[]');
            const post = posts.find(p => p.id == postId);
            
            if (!post) {
                alert('게시글을 찾을 수 없습니다.');
                window.location.href = '../index/index.html';
                return;
            }
            
            // 권한 체크: 현재 사용자가 작성자인지 확인
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            if (!checkAuthorPermission(post, currentUser)) {
                alert('이 게시글을 수정할 권한이 없습니다. 자신이 작성한 게시글만 수정할 수 있습니다.');
                window.location.href = `../detail/detail.html?id=${postId}`;
                return;
            }
            
            console.log('로컬 저장소에서 불러온 게시글:', post);
            // 현재 게시글 데이터 저장
            originalPost = post;
            displayPostData(post);
        } catch (localError) {
            console.error('게시글 데이터 로컬 로드 중 오류:', localError);
            alert('게시글 데이터를 불러오는 중 오류가 발생했습니다.');
            window.location.href = '../index/index.html';
        }
    }
    }
    
    // 게시글 데이터 표시 함수
    function displayPostData(post) {
        // 제목과 내용 설정
        titleInput.value = post.title || '';
        contentInput.value = post.content || '';
        if (titleCounter) {
            titleCounter.textContent = `${(post.title || '').length}/26`;
        }

        // 이미지가 있는 경우 미리보기 표시
        if (post.image) {
            currentImage.innerHTML = `<img src="${post.image}" alt="현재 이미지">`;
            selectedFile.textContent = "현재 이미지가 있습니다";
        } else {
            currentImage.innerHTML = '';
            selectedFile.textContent = "이미지 없음";
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
                selectedFile.textContent = "이미지 없음";
                return;
            }
            
            console.log('새 이미지 파일 선택됨:', file.name, file.type, file.size + ' bytes');
            selectedFile.textContent = "이미지 처리 중...";
            
            // 원본 이미지 데이터를 Base64로 변환
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // 원본 이미지 데이터
                newImageData = event.target.result;
                hasImageChanged = true;
                
                // 이미지 미리보기 업데이트
                currentImage.innerHTML = `<img src="${newImageData}" alt="선택된 이미지" style="max-width: 100%; max-height: 300px;">`;
                
                // 이미지 크기 표시 (KB 단위)
                const sizeInKB = Math.round(file.size / 1024);
                selectedFile.textContent = `${file.name} (원본 이미지, ${sizeInKB}KB)`;
                
                console.log('원본 이미지 로드 완료 - 파일 크기:', sizeInKB, 'KB');
                console.log('이미지 변경 플래그 설정됨:', hasImageChanged);
            };
            
            reader.onerror = function(error) {
                console.error('이미지 파일 읽기 실패:', error);
                alert('이미지 처리 중 오류가 발생했습니다.');
                selectedFile.textContent = "이미지 처리 실패";
                hasImageChanged = false;
                newImageData = null;
            };
            
            // 파일을 Base64 문자열로 읽기
            reader.readAsDataURL(file);
        }
    });

    // 제목 글자수 카운터
    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', function() {
            const length = this.value.length;
            titleCounter.textContent = `${length}/26`;
            
            if (length > 26) {
                this.value = this.value.substring(0, 26);
                titleCounter.textContent = '26/26';
            }
        });
    }

    // 게시글 삭제 함수
    async function deletePost() {
        try {
            // 현재 사용자 정보 가져오기
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (!currentUser || Object.keys(currentUser).length === 0) {
                alert('로그인이 필요한 서비스입니다.');
                return;
            }
            
            // 권한 확인: 해당 게시글의 작성자인지 확인
            if (!originalPost) {
                alert('게시글 정보가 없습니다.');
                return;
            }
            
            if (!checkAuthorPermission(originalPost, currentUser)) {
                alert('이 게시글을 삭제할 권한이 없습니다. 자신이 작성한 게시글만 삭제할 수 있습니다.');
                return;
            }
            
            // 삭제 확인
            if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                return;
            }
            
            console.log('게시글 삭제 요청 - ID:', postId);
            
            const token = sessionStorage.getItem('token');
            
            // API 호출
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('삭제 API 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            console.log('게시글 삭제 성공');
            
            // localStorage의 게시글 데이터도 업데이트
            try {
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                const postIndex = posts.findIndex(p => p.id == postId);
                
                if (postIndex !== -1) {
                    posts.splice(postIndex, 1);
                    localStorage.setItem('posts', JSON.stringify(posts));
                }
            } catch (localError) {
                console.error('로컬 데이터 삭제 중 오류:', localError);
            }
            
            alert('게시글이 삭제되었습니다.');
            window.location.href = '../index/index.html';
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서만 삭제
            try {
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                const postIndex = posts.findIndex(p => p.id == postId);
                
                if (postIndex === -1) {
                    alert('게시글을 찾을 수 없습니다.');
                    return;
                }
                
                // 삭제 권한 확인
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const post = posts[postIndex];
                
                if (!checkAuthorPermission(post, currentUser)) {
                    alert('이 게시글을 삭제할 권한이 없습니다. 자신이 작성한 게시글만 삭제할 수 있습니다.');
                    return;
                }
                
                // 게시글 삭제
                posts.splice(postIndex, 1);
                localStorage.setItem('posts', JSON.stringify(posts));
                
                alert('게시글이 삭제되었습니다. (로컬 저장소에서만 삭제됨)');
                window.location.href = '../index/index.html';
            } catch (localError) {
                console.error('로컬 데이터 삭제 중 오류:', localError);
                alert('게시글 삭제에 실패했습니다: ' + error.message);
            }
        }
    }

    // 게시글 업데이트 함수
    async function updatePost(updatedPost) {
        try {
            console.log('게시글 업데이트 요청 - ID:', postId);
            
            // 백엔드 API 형식에 맞게 요청 데이터 구성
            const requestBody = {
                title: updatedPost.title,
                content: updatedPost.content
            };
            
            // 이미지 데이터 처리 - postImage 필드 사용
            if (hasImageChanged && newImageData) {
                requestBody.postImage = newImageData;
                console.log('새 이미지 데이터 전송 - 크기:', Math.round(newImageData.length * 0.75 / 1024) + 'KB');
            } else if (updatedPost.postImage) {
                requestBody.postImage = updatedPost.postImage;
                console.log('기존 postImage 필드 유지');
            } else if (updatedPost.image) {
                requestBody.postImage = updatedPost.image;
                console.log('기존 image 필드를 postImage로 변환');
            }
            
            console.log('업데이트 요청 데이터:', {
                title: requestBody.title,
                content: requestBody.content.substring(0, 30) + '...',
                hasImage: !!requestBody.postImage
            });
            
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('업데이트 API 응답 상태:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('업데이트 실패 응답:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('업데이트 API 응답:', result);
            
            alert('게시글이 수정되었습니다.');
            window.location.href = `../detail/detail.html?id=${postId}`;
        } catch (error) {
            console.error('게시글 업데이트 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 업데이트
            try {
                console.log('API 호출 실패, localStorage 업데이트 시도');
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                const postIndex = posts.findIndex(p => p.id == postId);

                if (postIndex === -1) {
                    alert('게시글을 찾을 수 없습니다.');
                    return;
                }

                // 게시글 데이터 업데이트
                const localUpdatedPost = {...updatedPost};
                
                // 이미지 필드 통일 - image와 postImage 모두 설정
                if (hasImageChanged && newImageData) {
                    localUpdatedPost.image = newImageData;
                    localUpdatedPost.postImage = newImageData;
                }
                
                posts[postIndex] = localUpdatedPost;
                
                // localStorage 업데이트
                localStorage.setItem('posts', JSON.stringify(posts));
                
                alert('게시글이 수정되었습니다. (로컬 저장소에 저장됨)');
                window.location.href = `../detail/detail.html?id=${postId}`;
            } catch (localError) {
                console.error('localStorage 업데이트 중 오류:', localError);
                
                // 오류 발생 시 이미지 제거 후 다시 시도
                if (hasImageChanged && newImageData) {
                    try {
                        console.log('이미지 없이 다시 시도');
                        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                        const postIndex = posts.findIndex(p => p.id == postId);
                        
                        if (postIndex !== -1) {
                            const noImagePost = {...updatedPost};
                            noImagePost.image = null;
                            noImagePost.postImage = null;
                            
                            posts[postIndex] = noImagePost;
                            localStorage.setItem('posts', JSON.stringify(posts));
                            
                            alert('이미지를 제외한 게시글이 수정되었습니다. (이미지 크기 제한 초과)');
                            window.location.href = `../detail/detail.html?id=${postId}`;
                        }
                    } catch (finalError) {
                        console.error('최종 저장 시도 실패:', finalError);
                        alert('게시글 수정에 실패했습니다. 데이터를 정리한 후 다시 시도해주세요.');
                    }
                } else {
                    alert('게시글 수정에 실패했습니다.');
                }
            }
        }
    }
    

    // 폼 제출 처리
    if (modifyForm) {
        modifyForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!titleInput.value.trim() || !contentInput.value.trim()) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            try {
                // 게시글 데이터 수정 객체 준비
                const updatedPost = {
                    ...originalPost,
                    title: titleInput.value.trim(),
                    content: contentInput.value.trim(),
                    modifiedAt: new Date().toISOString()
                };

                // 이미지가 변경된 경우에만 이미지 업데이트
                if (hasImageChanged && newImageData) {
                    console.log('새로운 이미지 데이터 포함');
                    updatedPost.postImage = newImageData; // 백엔드 API 필드명
                    // image 필드는 제거하거나 null로 설정하여 혼동 방지
                    updatedPost.image = null;
                } else {
                    // 기존 이미지 유지 - postImage 필드로 통일
                    if (!updatedPost.postImage && updatedPost.image) {
                        updatedPost.postImage = updatedPost.image;
                    }
                    console.log('기존 이미지 유지');
                }

                // API를 사용하여 게시글 업데이트
                await updatePost(updatedPost);
            } catch (error) {
                console.error('게시글 수정 중 오류 발생:', error);
                alert('게시글 수정에 실패했습니다: ' + error.message);
            }
        });
    }

    // 뒤로가기 버튼
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = `../detail/detail.html?id=${postId}`;
        });
    }

    // 초기화
    if (postId) {
        fetchPostData();
        // 사용자 정보 표시 함수 호출
        window.headerUtils.displayUserInfo();
    } else {
        alert('게시글 ID가 없습니다.');
        window.location.href = '../index/index.html';
    }
});