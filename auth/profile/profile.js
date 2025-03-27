document.addEventListener('DOMContentLoaded', function() {
    // 헤더 명시적 초기화 추가
    setTimeout(() => {
        if (window.headerUtils && window.headerUtils.initHeader) {
            window.headerUtils.initHeader();
        }
    }, 100)
    

    // 초기 로그인 체크
    if (!window.headerUtils.checkLogin()) return;

    // API URL (실제 환경에서는 실제 API 엔드포인트로 대체)
    const API_URL = 'http://localhost:8080/api';

    // 드롭다운 메뉴 관련 요소
    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    
    // 닉네임 입력 필드와 관련 요소들
    const nicknameInput = document.getElementById('nickname');
    const nicknameHelper = document.getElementById('nicknameHelper');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');

    // 회원 탈퇴 모달 관련 요소
    const withdrawBtn = document.getElementById('withdrawBtn');
    const withdrawModal = document.getElementById('withdrawModal');
    const modalCancelBtn = withdrawModal.querySelector('.modal-cancel');
    const modalConfirmBtn = withdrawModal.querySelector('.modal-confirm');

    // 프로필 이미지 변경 관련 요소
    const profileImageEdit = document.querySelector('.profile-image-edit');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Fetch API를 사용한 사용자 정보 로드
    async function fetchUserInfo() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) {
            throw new Error('사용자 정보가 없습니다');
        }
        
        const token = sessionStorage.getItem('token');
        
        // 백엔드 컨트롤러 기반으로 올바른 엔드포인트 사용
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('사용자 정보 조회 응답:', userData);
        
        // 응답 구조 처리
        let userInfo = userData;
        if (userData.success && userData.data) {
            userInfo = userData.data;
        }
        
        displayUserInfo(userInfo);
        
        // 최신 사용자 정보 로컬에 업데이트
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        return userInfo;
    } catch (error) {
        console.error('사용자 정보 로드 중 오류:', error);
        
        // API 호출 실패 시 localStorage 데이터 사용
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        displayUserInfo(currentUser);
        return currentUser;
    }
    }

    
    // 사용자 정보 표시 함수
    function displayUserInfo(userData) {
        if (userData) {
            // 이메일 필드에 현재 사용자 이메일 설정
            const emailInput = document.querySelector('input[type="email"]');
            if (emailInput) {
                emailInput.value = userData.email || '';
            }

            // 닉네임 필드에 현재 사용자 닉네임 설정
            if (nicknameInput) {
                nicknameInput.value = userData.nickname || '';
                nicknameInput.placeholder = userData.nickname || '닉네임을 입력하세요';
            }

            // 프로필 이미지 설정
            if (userData.profileImage && profileImageEdit) {
                    profileImageEdit.style.backgroundImage = `url(${userData.profileImage})`;
                    profileImageEdit.style.backgroundSize = 'cover';
            }
        }
    }

    // Fetch API를 사용한 닉네임 중복 검사
    async function checkNicknameDuplicate(nickname) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            // 현재 사용자의 닉네임과 같은 경우는 중복 체크 제외
            if (currentUser && nickname === currentUser.nickname) {
                return false;
            }
            
            // 로컬 스토리지에서 중복 확인 (서버 API 오류 방지)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const isDuplicate = users.some(user => user.nickname === nickname);
            
            return isDuplicate;
        } catch (error) {
            console.error('닉네임 중복 검사 중 오류:', error);
            return false; // 오류 발생 시 중복이 아니라고 가정
        }
    }

    // 닉네임 유효성 검사
    async function validateNickname() {
        const nickname = nicknameInput.value.trim();
        
        if (nickname === '') {
            nicknameHelper.textContent = '* 닉네임을 입력해주세요';
            nicknameHelper.style.display = 'block';
            return false;
        }
        
        if (nickname.length > 10) {
            nicknameHelper.textContent = '* 닉네임은 최대 10자까지 작성 가능합니다';
            nicknameHelper.style.display = 'block';
            return false;
        }

        // 닉네임 중복 체크
        const isDuplicate = await checkNicknameDuplicate(nickname);
        
        if (isDuplicate) {
            nicknameHelper.textContent = '* 중복된 닉네임입니다';
            nicknameHelper.style.display = 'block';
            return false;
        }

        nicknameHelper.style.display = 'none';
        return true;
    }

    // 이미지 압축 함수
    function compressImage(imgFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imgFile);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    // 이미지 크기 줄이기
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 200;
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;
                    
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
                    
                    // 이미지 압축
                    const compressedImageData = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(compressedImageData);
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

    // 프로필 이미지 클릭 이벤트
    profileImageEdit.addEventListener('click', function() {
        fileInput.click();
    });

    // 파일 선택 이벤트
    fileInput.addEventListener('change', async function(e) {
        if (this.files && this.files[0]) {
            try {
                const file = this.files[0];
                // 이미지 파일 체크
                if (!file.type.startsWith('image/')) {
                    alert('이미지 파일만 업로드 가능합니다.');
                    return;
                }
                
                // 이미지 압축
                const compressedImage = await compressImage(file);
                
                // 이미지 미리보기 적용
                profileImageEdit.style.backgroundImage = `url(${compressedImage})`;
                profileImageEdit.style.backgroundSize = 'cover';
                
                // 이미지 정보 임시 저장 (submitBtn 클릭 이벤트에서 사용)
                profileImageEdit.dataset.newImage = compressedImage;
            } catch (error) {
                console.error('이미지 처리 중 오류:', error);
                alert('이미지 처리 중 오류가 발생했습니다.');
            }
        }
    });

    // Fetch API를 사용한 프로필 업데이트
    async function updateUserProfile(nickname, profileImage) {
    try {
        const token = sessionStorage.getItem('token');
        
        // 요청 데이터 구성
        const updateData = {
            nickname: nickname.trim(),
            profileImage: profileImage
        };
        
        console.log('프로필 업데이트 요청 데이터:', updateData);
        
        // 백엔드 컨트롤러와 일치하는 엔드포인트 사용
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('프로필 업데이트 응답:', responseData);
        
        // 응답 구조 처리
        let updatedUser = responseData;
        if (responseData.success && responseData.data) {
            updatedUser = responseData.data;
        }
        
        // 로컬 사용자 정보 업데이트
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return true;
    } catch (error) {
        console.error('프로필 업데이트 중 오류:', error);
        
        // 폴백 처리 (기존 코드 유지)
        try {
            // 현재 사용자 정보 가져오기
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // users 배열에서 현재 사용자 찾기
            const userIndex = users.findIndex(user => user.email === currentUser.email);
            
            if (userIndex !== -1) {
                // 사용자 정보 업데이트
                users[userIndex].nickname = nickname.trim();
                
                // 새로운 프로필 이미지가 있으면 업데이트
                if (profileImage) {
                    users[userIndex].profileImage = profileImage;
                    currentUser.profileImage = profileImage;
                }
                
                // localStorage 업데이트
                localStorage.setItem('users', JSON.stringify(users));
                
                // currentUser 정보도 업데이트
                currentUser.nickname = nickname.trim();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                return true;
            }
            return false;
        } catch (localError) {
            console.error('로컬 프로필 업데이트 중 오류:', localError);
            return false;
        }
    }
    }

    // 비밀번호 변경 함수
    async function updatePassword(newPassword) {
    try {
        const token = sessionStorage.getItem('token');
        
        // 요청 데이터 구성
        const updateData = {
            password: newPassword
        };
        
        const response = await fetch(`${API_URL}/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
        
        // API 호출 실패 시 localStorage에서 직접 업데이트
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // users 배열에서 현재 사용자 찾기
            const userIndex = users.findIndex(user => user.email === currentUser.email);
            
            if (userIndex !== -1) {
                // 비밀번호 업데이트
                users[userIndex].password = newPassword;
                
                // localStorage 업데이트
                localStorage.setItem('users', JSON.stringify(users));
                return true;
            }
            return false;
        } catch (localError) {
            console.error('로컬 비밀번호 업데이트 중 오류:', localError);
            return false;
        }
    }
    }
    // 수정하기 버튼 클릭 이벤트
    submitBtn.addEventListener('click', async function() {
        if (await validateNickname()) {
            try {
                const profileImage = profileImageEdit.dataset.newImage || null;
                const success = await updateUserProfile(nicknameInput.value, profileImage);
                
                if (success) {
                    toast.textContent = "회원정보가 수정되었습니다";
                    toast.classList.add('show');
                    
                    // 2초 후 토스트 메시지 숨기기 및 페이지 이동
                    setTimeout(() => {
                        toast.classList.remove('show');
                        window.location.href = '../../post/index/index.html';
                    }, 2000);
                } else {
                    toast.textContent = "회원정보 수정에 실패했습니다";
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 2000);
                }
            } catch (error) {
                console.error('회원정보 수정 중 오류 발생:', error);
                toast.textContent = "회원정보 수정에 실패했습니다";
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            }
        }
    });

    // 입력 필드 변경시마다 유효성 검사
    nicknameInput.addEventListener('input', function() {
        validateNickname();
    });

    // Fetch API를 사용한 회원 탈퇴
    async function deleteUserAccount() {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const token = sessionStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/users/${currentUser.email}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 로그인 정보 삭제
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('token');
            
            return true;
        } catch (error) {
            console.error('회원 탈퇴 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 처리
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // users 배열에서 현재 사용자 제거
                const updatedUsers = users.filter(user => user.email !== currentUser.email);
                
                // localStorage 업데이트
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                // 로그인 정보 삭제
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('token');
                
                return true;
            } catch (localError) {
                console.error('로컬 회원 탈퇴 처리 중 오류:', localError);
                return false;
            }
        }
    }

    // 회원 탈퇴 버튼 클릭 시 모달 표시
    withdrawBtn.addEventListener('click', function() {
        withdrawModal.classList.add('show');
    });

    // 모달 취소 버튼 클릭 시 모달 닫기
    modalCancelBtn.addEventListener('click', function() {
        withdrawModal.classList.remove('show');
    });

    // 모달 확인 버튼 클릭 시 회원 탈퇴 처리
    modalConfirmBtn.addEventListener('click', async function() {
        try {
            const success = await deleteUserAccount();
            
            if (success) {
                // 로그인 페이지로 이동
                window.location.href = '../../auth/login/login.html';
            } else {
                alert('회원 탈퇴에 실패했습니다.');
                withdrawModal.classList.remove('show');
            }
        } catch (error) {
            console.error('회원 탈퇴 중 오류 발생:', error);
            alert('회원 탈퇴에 실패했습니다.');
            withdrawModal.classList.remove('show');
        }
    });

    // 초기 페이지 로드 시 사용자 정보 표시
    fetchUserInfo();
});