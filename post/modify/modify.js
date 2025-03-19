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

    // 이미지 압축 함수
    function compressImage(imgFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imgFile);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    // 크기 조정
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;
                    
                    // 비율 유지하면서 크기 조정
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 낮은 품질로 압축 (0.1 = 10% 품질)
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.1);
                    
                    // 이미지 크기 확인 (대략적인 계산)
                    const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
                    const sizeInBytes = base64Length * 0.75;
                    const sizeInKB = sizeInBytes / 1024;
                    
                    console.log(`압축된 이미지 크기: 약 ${sizeInKB.toFixed(2)}KB`);
                    
                    // 만약 크기가 100KB보다 크면 추가 압축 수행
                    if (sizeInKB > 100) {
                        console.log('이미지가 여전히 너무 큽니다. 추가 압축 수행...');
                        // 더 작은 크기로 다시 압축
                        const smallerCanvas = document.createElement('canvas');
                        const SMALLER_MAX = 200;
                        let smallerWidth = width;
                        let smallerHeight = height;
                        
                        if (smallerWidth > smallerHeight) {
                            if (smallerWidth > SMALLER_MAX) {
                                smallerHeight *= SMALLER_MAX / smallerWidth;
                                smallerWidth = SMALLER_MAX;
                            }
                        } else {
                            if (smallerHeight > SMALLER_MAX) {
                                smallerWidth *= SMALLER_MAX / smallerHeight;
                                smallerHeight = SMALLER_MAX;
                            }
                        }
                        
                        smallerCanvas.width = smallerWidth;
                        smallerCanvas.height = smallerHeight;
                        const smallerCtx = smallerCanvas.getContext('2d');
                        smallerCtx.drawImage(img, 0, 0, smallerWidth, smallerHeight);
                        
                        // 더 낮은 품질로 압축 (0.05 = 5% 품질)
                        resolve(smallerCanvas.toDataURL('image/jpeg', 0.05));
                    } else {
                        resolve(compressedDataUrl);
                    }
                };
                img.onerror = function() {
                    reject(new Error('이미지 로드 실패'));
                };
            };
            reader.onerror = function() {
                reject(new Error('파일 읽기 실패'));
            };
        });
    }

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
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // detail.js와 유사하게 다양한 ID 필드 검사
        const isAuthor = currentUser && 
                       (post.userId === currentUser.id || 
                        post.authorId === currentUser.id || 
                        post.author === currentUser.nickname);
        
        if (!isAuthor) {
            alert('이 게시글을 수정할 권한이 없습니다.');
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
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const isAuthor = currentUser && 
                          (post.userId === currentUser.id || 
                           post.authorId === currentUser.id || 
                           post.author === currentUser.nickname);
            
            if (!isAuthor) {
                alert('이 게시글을 수정할 권한이 없습니다.');
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

    // 게시글 업데이트
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

    // 드롭다운 메뉴 관련 이벤트
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            menuList.classList.toggle('show');
            e.stopPropagation();
        });

        document.addEventListener('click', function() {
            menuList.classList.remove('show');
        });
    }

    // 메뉴 항목 클릭 이벤트
    if (menuList) {
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
    }

    // 초기화
    if (postId) {
        fetchPostData();
    } else {
        alert('게시글 ID가 없습니다.');
        window.location.href = '../index/index.html';
    }
});