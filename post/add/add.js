document.addEventListener('DOMContentLoaded', function() {
 
    // 초기 로그인 체크
    if (!window.headerUtils.checkLogin()) return;
 
    // DOM 요소
    const postForm = document.querySelector('.post-form');
    const titleInput = document.getElementById('title');
    const contentTextarea = document.getElementById('content');
    const fileInput = document.querySelector('.attach-button');
    const helperText = document.querySelector('.helper-text');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
 
    // 숨겨진 파일 업로드 input 요소 생성
    const realFileInput = document.createElement('input');
    realFileInput.type = 'file';
    realFileInput.accept = 'image/jpeg,image/png,image/gif';
    realFileInput.style.display = 'none';
    document.body.appendChild(realFileInput);
 
    let uploadedImage = null;
 
    // 파일 선택 버튼 클릭 시 파일 업로드 트리거
    fileInput.addEventListener('click', function() {
        realFileInput.click();
    });

    // 파일 선택 시 이미지 업로드 처리 (압축 없이 원본 사용)
    realFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (file) {
        if (!file.type.startsWith('image/')) {
            helperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
            helperText.style.color = 'red';
            return;
        }
        
        // 파일 정보 표시
        console.log('선택된 이미지 파일:', file.name, file.type, file.size, 'bytes');
        helperText.textContent = '* 이미지 처리 중...';
        helperText.style.color = 'blue';
        
        // 이미지 파일을 Base64로 변환 (압축 없이 원본 그대로)
        const reader = new FileReader();
        
        reader.onload = function(event) {
            // 원본 이미지 데이터를 Base64로 변환
            uploadedImage = event.target.result;
            
            // 이미지 사이즈 계산 (KB 단위로)
            const sizeInKB = Math.round(file.size / 1024);
            
            helperText.textContent = `* ${file.name} 선택됨 (원본 이미지, ${sizeInKB}KB)`;
            helperText.style.color = 'green';
            
            console.log('이미지 로드 완료 - 원본 크기:', sizeInKB, 'KB');
        };
        
        reader.onerror = function() {
            console.error('이미지 파일 읽기 실패');
            helperText.textContent = '* 이미지 처리에 실패했습니다. 다시 시도하세요.';
            helperText.style.color = 'red';
            uploadedImage = null;
        };
        
        // 파일을 Base64 문자열로 읽기
        reader.readAsDataURL(file);
    }
    });
 
    // API 요청 함수 디버깅용 래퍼
    async function fetchWithDebug(apiFunction, ...args) {
        try {
            console.log(`API 호출: ${apiFunction.name} 함수, 인자:`, ...args);
            const result = await apiFunction(...args);
            console.log(`API 응답 결과:`, result);
            return result;
        } catch (error) {
            console.error(`API 에러 (${apiFunction.name}):`, error);
            throw error;
        }
    }

    // 게시글 추가 함수
    async function createPost(postData) {
        try {
            // 백엔드 API 형식에 맞게 데이터 변환 - 정확히 백엔드 DTO 필드와 일치시킴
            const apiPostData = {
                title: postData.title,
                content: postData.content,
                postImage: postData.image || null
            };
            
            console.log('백엔드로 전송할 데이터:', apiPostData);
            
            // 디버깅을 위한 래퍼 함수 사용
            const result = await fetchWithDebug(postAPI.createPost, apiPostData);
            
            alert('게시글이 등록되었습니다.');
            window.location.href = '../index/index.html';
            return result;
        } catch (error) {
            console.error('게시글 생성 중 오류:', error);
            
            // 오류가 401 (인증 실패)인 경우 로그인 페이지로 리디렉션
            if (error.message && error.message.includes('401')) {
                alert('로그인이 필요하거나 세션이 만료되었습니다.');
                window.location.href = '../../auth/login/login.html';
                return;
            }
            
            // 서버 오류(500)인 경우 로컬 저장으로 대체
            if (error.message && error.message.includes('500')) {
                alert('서버 오류가 발생했습니다. 로컬에 저장합니다.');
                
                // 로컬 저장소에 저장 시도
                try {
                    let posts = [];
                    try {
                        posts = JSON.parse(localStorage.getItem('posts') || '[]');
                    } catch (parseError) {
                        console.error('기존 게시글 데이터 파싱 오류:', parseError);
                        posts = [];
                    }
                    
                    // 새 게시글을 맨 앞에 추가
                    posts.unshift(postData);
                    
                    // localStorage에 저장 시도
                    localStorage.setItem('posts', JSON.stringify(posts));
                    alert('게시글이 로컬에 등록되었습니다.');
                    window.location.href = '../index/index.html';
                } catch (localError) {
                    console.error('localStorage 저장 중 오류:', localError);
                    
                    // 오류 발생 시 이미지 없이 저장 시도
                    if (postData.image) {
                        postData.image = null;
                        
                        try {
                            let posts = JSON.parse(localStorage.getItem('posts') || '[]');
                            posts.unshift(postData);
                            localStorage.setItem('posts', JSON.stringify(posts));
                            alert('이미지를 제외한 게시글이 로컬에 등록되었습니다.');
                            window.location.href = '../index/index.html';
                        } catch (finalError) {
                            alert('게시글 등록에 실패했습니다. 게시글 데이터를 정리한 후 다시 시도해주세요.');
                        }
                    } else {
                        alert('게시글 등록에 실패했습니다.');
                    }
                }
            } else {
                // 기타 오류
                alert('게시글 등록에 실패했습니다: ' + error.message);
            }
            
            throw error;
        }
    }

    // 폼 제출 이벤트
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title) {
            alert('제목을 입력해주세요.');
            titleInput.focus();
            return;
        }
        
        if (!content) {
            alert('내용을 입력해주세요.');
            contentTextarea.focus();
            return;
        }

        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                alert('로그인 정보를 찾을 수 없습니다.');
                window.location.href = '../../auth/login/login.html';
                return;
            }
            
            // 프론트엔드용 포스트 데이터 (로컬 저장용)
            const postData = {
                title,
                content,
                image: uploadedImage,
                authorId: currentUser.id,
                author: currentUser.nickname,
                authorImage: currentUser.profileImage,
                createdAt: new Date().toISOString(),
                likes: 0,
                views: 0,
                comments: 0
            };
            
            // 전송 전 토큰 확인
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('인증 정보가 없습니다. 다시 로그인해주세요.');
                window.location.href = '../../auth/login/login.html';
                return;
            }
            
            console.log('게시글 생성 시도:', postData);
            
            // API를 사용하여 게시글 생성
            await createPost(postData);
        } catch (error) {
            console.error('게시글 저장 중 오류 발생:', error);
        }
    });
 
    // 초기화
    window.headerUtils.displayUserInfo();
});