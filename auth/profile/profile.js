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

    // 현재 사용자 정보 로드
    function loadUserInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            // 이메일 필드에 현재 사용자 이메일 설정
            const emailInput = document.querySelector('input[type="email"]');
            if (emailInput) {
                emailInput.value = currentUser.email || '';
            }

            // 닉네임 필드에 현재 사용자 닉네임 설정
            if (nicknameInput) {
                nicknameInput.value = currentUser.nickname || '';
                nicknameInput.placeholder = currentUser.nickname || '닉네임을 입력하세요';
            }

            // 프로필 이미지 설정
            if (currentUser.profileImage) {
                profileDropdown.src = currentUser.profileImage;
                if (profileImageEdit) {
                    profileImageEdit.style.backgroundImage = `url(${currentUser.profileImage})`;
                    profileImageEdit.style.backgroundSize = 'cover';
                }
            }
        }
    }

    // 닉네임 유효성 검사
    function validateNickname() {
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

        // 현재 사용자의 닉네임과 같은 경우는 중복 체크 제외
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && nickname === currentUser.nickname) {
            nicknameHelper.style.display = 'none';
            return true;
        }
        
        // 닉네임 중복 체크
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const isDuplicate = users.some(user => user.nickname === nickname);
        
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

    // 수정하기 버튼 클릭 이벤트
    submitBtn.addEventListener('click', function() {
        if (validateNickname()) {
            try {
                // 현재 사용자 정보 가져오기
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // users 배열에서 현재 사용자 찾기
                const userIndex = users.findIndex(user => user.email === currentUser.email);
                
                if (userIndex !== -1) {
                    // 사용자 정보 업데이트
                    users[userIndex].nickname = nicknameInput.value.trim();
                    
                    // 새로운 프로필 이미지가 있으면 업데이트
                    if (profileImageEdit.dataset.newImage) {
                        users[userIndex].profileImage = profileImageEdit.dataset.newImage;
                        currentUser.profileImage = profileImageEdit.dataset.newImage;
                    }
                    
                    // localStorage 업데이트
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    // currentUser 정보도 업데이트
                    currentUser.nickname = nicknameInput.value.trim();
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // 토스트 메시지 표시
                    toast.textContent = "회원정보가 수정되었습니다";
                    toast.classList.add('show');
                    
                    // 2초 후 토스트 메시지 숨기기 및 페이지 이동
                    setTimeout(() => {
                        toast.classList.remove('show');
                        window.location.href = '../../post/index/index.html';
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
    nicknameInput.addEventListener('input', validateNickname);

    // 회원 탈퇴 버튼 클릭 시 모달 표시
    withdrawBtn.addEventListener('click', function() {
        withdrawModal.classList.add('show');
    });

    // 모달 취소 버튼 클릭 시 모달 닫기
    modalCancelBtn.addEventListener('click', function() {
        withdrawModal.classList.remove('show');
    });

    // 모달 확인 버튼 클릭 시 회원 탈퇴 처리
    modalConfirmBtn.addEventListener('click', function() {
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

            // 로그인 페이지로 이동
            window.location.href = '../../auth/login/login.html';
        } catch (error) {
            console.error('회원 탈퇴 중 오류 발생:', error);
            alert('회원 탈퇴에 실패했습니다.');
        }
    });

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
                window.location.href = '../profile/profile.html';
                break;
            case '비밀번호수정':
                window.location.href = '../password/password.html';
                break;
            case '로그아웃':
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                window.location.href = '../login/login.html';
                break;
        }
    });

    // 초기 페이지 로드 시 사용자 정보 표시
    loadUserInfo();
});