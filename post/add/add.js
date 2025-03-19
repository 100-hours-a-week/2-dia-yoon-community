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
        const profileImage = document.querySelector('.profile-image') || document.getElementById('profileDropdown');
        
        if (currentUser && currentUser.profileImage && profileImage) {
            console.log('프로필 이미지 설정:', currentUser.profileImage);
            profileImage.src = currentUser.profileImage;
        } else {
            console.log('기본 프로필 이미지 사용');
            // 기본 프로필 이미지 경로 설정
            if(profileImage) profileImage.src = '../images/default-profile.png';
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
    // function compressImage(imgFile) {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(imgFile);
    //         reader.onload = function(event) {
    //             const img = new Image();
    //             img.src = event.target.result;
    //             img.onload = function() {
    //                 // 매우 작은 크기로 설정 (300x300 픽셀)
    //                 const canvas = document.createElement('canvas');
    //                 const MAX_WIDTH = 300;
    //                 const MAX_HEIGHT = 300;
    //                 let width = img.width;
    //                 let height = img.height;
                    
    //                 // 비율 유지하면서 크기 조정
    //                 if (width > height) {
    //                     if (width > MAX_WIDTH) {
    //                         height *= MAX_WIDTH / width;
    //                         width = MAX_WIDTH;
    //                     }
    //                 } else {
    //                     if (height > MAX_HEIGHT) {
    //                         width *= MAX_HEIGHT / height;
    //                         height = MAX_HEIGHT;
    //                     }
    //                 }
                    
    //                 canvas.width = width;
    //                 canvas.height = height;
    //                 const ctx = canvas.getContext('2d');
    //                 ctx.drawImage(img, 0, 0, width, height);
                    
    //                 // 매우 낮은 품질로 압축 (0.1 = 10% 품질)
    //                 const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.1);
                    
    //                 // 추가 검사: 결과가 data:image/jpeg;base64, 로 시작하는지 확인
    //                 if (!compressedDataUrl.startsWith('data:image/jpeg;base64,')) {
    //                     reject(new Error('이미지 형식 오류'));
    //                     return;
    //                 }
                    
    //                 // 이미지 크기 확인 (대략적인 계산)
    //                 const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
    //                 const sizeInBytes = base64Length * 0.75; // base64는 원본 크기의 약 4/3
    //                 const sizeInKB = sizeInBytes / 1024;
                    
    //                 console.log(`압축된 이미지 크기: 약 ${sizeInKB.toFixed(2)}KB`);
                    
    //                 // 만약 크기가 100KB보다 크면 추가 압축 수행
    //                 if (sizeInKB > 100) {
    //                     console.log('이미지가 여전히 너무 큽니다. 추가 압축 수행...');
    //                     // 더 작은 크기로 다시 압축
    //                     const smallerCanvas = document.createElement('canvas');
    //                     const SMALLER_MAX = 200; // 더 작은 크기로 제한
    //                     let smallerWidth = width;
    //                     let smallerHeight = height;
                        
    //                     if (smallerWidth > smallerHeight) {
    //                         if (smallerWidth > SMALLER_MAX) {
    //                             smallerHeight *= SMALLER_MAX / smallerWidth;
    //                             smallerWidth = SMALLER_MAX;
    //                         }
    //                     } else {
    //                         if (smallerHeight > SMALLER_MAX) {
    //                             smallerWidth *= SMALLER_MAX / smallerHeight;
    //                             smallerHeight = SMALLER_MAX;
    //                         }
    //                     }
                        
    //                     smallerCanvas.width = smallerWidth;
    //                     smallerCanvas.height = smallerHeight;
    //                     const smallerCtx = smallerCanvas.getContext('2d');
    //                     smallerCtx.drawImage(img, 0, 0, smallerWidth, smallerHeight);
                        
    //                     // 더 낮은 품질로 압축 (0.05 = 5% 품질)
    //                     resolve(smallerCanvas.toDataURL('image/jpeg', 0.05));
    //                 } else {
    //                     resolve(compressedDataUrl);
    //                 }
    //             };
    //             img.onerror = function() {
    //                 reject(new Error('이미지 로드 실패'));
    //             };
    //         };
    //         reader.onerror = function() {
    //             reject(new Error('파일 읽기 실패'));
    //         };
    //     });
    // }

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
    displayUserInfo();
});