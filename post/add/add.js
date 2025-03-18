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
    const postForm = document.querySelector('.post-form');
    const titleInput = document.getElementById('title');
    const contentTextarea = document.getElementById('content');
    const fileInput = document.querySelector('.attach-button');
    const helperText = document.querySelector('.helper-text');
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
 
    // 현재 로그인한 사용자 정보 표시
    function displayUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.profileImage) {
            profileDropdown.src = currentUser.profileImage;
        }
    }
 
    // 숨겨진 파일 업로드 input 요소 생성
    const realFileInput = document.createElement('input');
    realFileInput.type = 'file';
    realFileInput.accept = 'image/jpeg,image/png,image/gif';
    realFileInput.style.display = 'none';
    document.body.appendChild(realFileInput);
 
    let uploadedImage = null;
 
    // 극단적인 이미지 압축 함수
    function compressImage(imgFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imgFile);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    // 매우 작은 크기로 설정 (300x300 픽셀)
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
                    
                    // 매우 낮은 품질로 압축 (0.1 = 10% 품질)
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.1);
                    
                    // 추가 검사: 결과가 data:image/jpeg;base64, 로 시작하는지 확인
                    if (!compressedDataUrl.startsWith('data:image/jpeg;base64,')) {
                        reject(new Error('이미지 형식 오류'));
                        return;
                    }
                    
                    // 이미지 크기 확인 (대략적인 계산)
                    const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
                    const sizeInBytes = base64Length * 0.75; // base64는 원본 크기의 약 4/3
                    const sizeInKB = sizeInBytes / 1024;
                    
                    console.log(`압축된 이미지 크기: 약 ${sizeInKB.toFixed(2)}KB`);
                    
                    // 만약 크기가 100KB보다 크면 추가 압축 수행
                    if (sizeInKB > 100) {
                        console.log('이미지가 여전히 너무 큽니다. 추가 압축 수행...');
                        // 더 작은 크기로 다시 압축
                        const smallerCanvas = document.createElement('canvas');
                        const SMALLER_MAX = 200; // 더 작은 크기로 제한
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
 
    // 파일 선택 버튼 클릭 시 파일 업로드 트리거
    fileInput.addEventListener('click', function() {
        realFileInput.click();
    });
 
    // 파일 선택 시 이미지 업로드 처리
    realFileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
 
        if (file) {
            if (!file.type.startsWith('image/')) {
                helperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
                helperText.style.color = 'red';
                return;
            }
            
            try {
                helperText.textContent = '* 이미지 처리 중...';
                helperText.style.color = 'blue';
                
                // 이미지 압축
                uploadedImage = await compressImage(file);
                
                helperText.textContent = `* ${file.name} 선택됨 (압축완료)`;
                helperText.style.color = 'green';
            } catch (error) {
                console.error('이미지 처리 실패:', error);
                helperText.textContent = '* 이미지 처리에 실패했습니다. 다시 시도하세요.';
                helperText.style.color = 'red';
                uploadedImage = null;
            }
        }
    });
 
    // 게시글 추가 함수
    async function createPost(postData) {
        try {
            // API를 통해 게시글 생성
            const result = await postAPI.createPost(postData);
            alert('게시글이 등록되었습니다.');
            window.location.href = '../index/index.html';
            return result;
        } catch (error) {
            console.error('게시글 생성 중 오류:', error);
            
            // API 호출 실패 시 localStorage에 직접 저장
            try {
                let posts = [];
                try {
                    posts = JSON.parse(localStorage.getItem('posts') || '[]');
                } catch (error) {
                    console.error('기존 게시글 데이터 파싱 오류:', error);
                    posts = [];
                }
                
                // 새 게시글을 맨 앞에 추가
                posts.unshift(postData);
                
                // localStorage에 저장 시도
                localStorage.setItem('posts', JSON.stringify(posts));
                alert('게시글이 등록되었습니다.');
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
                        alert('이미지를 제외한 게시글이 등록되었습니다.');
                        window.location.href = '../index/index.html';
                    } catch (finalError) {
                        alert('게시글 등록에 실패했습니다. 게시글 데이터를 정리한 후 다시 시도해주세요.');
                    }
                } else {
                    alert('게시글 등록에 실패했습니다.');
                }
            }
            throw error;
        }
    }
 
    // 폼 제출 이벤트
    postForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
 
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            const postData = {
                title,
                content,
                image: uploadedImage,
                authorId: currentUser.id, // 백엔드에서 필요한 경우
                author: currentUser.nickname,
                authorImage: currentUser.profileImage
            };
            
            // API를 사용하여 게시글 생성
            await createPost(postData);
        } catch (error) {
            console.error('게시글 저장 중 오류 발생:', error);
            alert('게시글 등록에 실패했습니다: ' + error.message);
        }
    });
 
    // 초기화
    displayUserInfo();
});