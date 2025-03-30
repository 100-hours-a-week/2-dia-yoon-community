document.addEventListener('DOMContentLoaded', function() {

    // 초기 로그인 체크
    if (!window.headerUtils.checkLogin()) return;

    // API URL (실제 환경에서는 실제 API 엔드포인트로 대체)
    const API_URL = 'http://localhost:8080/api';

    const profileDropdown = document.getElementById('profileDropdown');
    const menuList = document.getElementById('menuList');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordHelper = document.getElementById('passwordHelper');
    const confirmPasswordHelper = document.getElementById('confirmPasswordHelper');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');

    let isPasswordValid = false;
    let isConfirmPasswordValid = false;

    // 비밀번호 유효성 검사 함수
    function validatePassword(password) {
        if (!password) {
            passwordHelper.textContent = "* 비밀번호를 입력해주세요";
            passwordHelper.style.display = "block";
            return false;
        }

        if (password.length < 8 || password.length > 20) {
            passwordHelper.textContent = "* 비밀번호는 8자 이상, 20자 이하여야 합니다";
            passwordHelper.style.display = "block";
            return false;
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
            passwordHelper.textContent = "* 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다";
            passwordHelper.style.display = "block";
            return false;
        }

        passwordHelper.style.display = "none";
        return true;
    }

    // 비밀번호 확인 유효성 검사 함수
    function validateConfirmPassword(password, confirmPassword) {
        if (!confirmPassword) {
            confirmPasswordHelper.textContent = "* 비밀번호를 한번 더 입력해주세요";
            confirmPasswordHelper.style.display = "block";
            return false;
        }

        if (password !== confirmPassword) {
            confirmPasswordHelper.textContent = "* 비밀번호가 일치하지 않습니다";
            confirmPasswordHelper.style.display = "block";
            return false;
        }

        confirmPasswordHelper.style.display = "none";
        return true;
    }

    // Fetch API를 사용한 비밀번호 업데이트 함수
    async function updateUserPassword(newPassword) {
        try {
            // 현재 로그인한 사용자 정보 가져오기
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const token = sessionStorage.getItem('token');
            
            // API 경로 수정: /users/{email}/password -> /users/password
            const response = await fetch(`${API_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            console.log('비밀번호 변경 API 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 서버에서 응답 데이터 받기
            const result = await response.json();
            console.log('비밀번호 변경 API 응답:', result);
            
            return true;
        } catch (error) {
            console.error('비밀번호 업데이트 API 호출 중 오류:', error);
            
            // API 호출 실패 시 localStorage에서 직접 업데이트
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // users 배열에서 현재 사용자 찾기
                const userIndex = users.findIndex(user => user.email === currentUser.email);
                
                if (userIndex !== -1) {
                    // 사용자 비밀번호 업데이트
                    users[userIndex].password = newPassword;
                    
                    // localStorage 업데이트
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    return true;
                }
                return false;
            } catch (localError) {
                console.error('localStorage 비밀번호 업데이트 중 오류:', localError);
                return false;
            }
        }
    }

    // 버튼 상태 업데이트
    function updateSubmitButton() {
        if (isPasswordValid && isConfirmPasswordValid) {
            submitBtn.style.backgroundColor = "#7F6AEE";
            submitBtn.disabled = false;
        } else {
            submitBtn.style.backgroundColor = "#ACA0EB";
            submitBtn.disabled = true;
        }
    }

    // 비밀번호 입력 이벤트
    passwordInput.addEventListener('input', function() {
        isPasswordValid = validatePassword(this.value);
        isConfirmPasswordValid = validateConfirmPassword(this.value, confirmPasswordInput.value);
        updateSubmitButton();
    });

    // 비밀번호 확인 입력 이벤트
    confirmPasswordInput.addEventListener('input', function() {
        isConfirmPasswordValid = validateConfirmPassword(passwordInput.value, this.value);
        updateSubmitButton();
    });

    // 수정하기 버튼 클릭 이벤트 - 비밀번호 변경 후 강제 로그아웃 적용
    submitBtn.addEventListener('click', async function() {
        if (isPasswordValid && isConfirmPasswordValid) {
            const success = await updateUserPassword(passwordInput.value);
            
            if (success) {
                toast.textContent = "비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.";
                toast.classList.add('show');
                
                // 로그아웃 처리
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('token');
                
                // 3초 후 로그인 페이지로 이동
                setTimeout(() => {
                    toast.classList.remove('show');
                    window.location.href = '../../auth/login/login.html';
                }, 3000);
            } else {
                toast.textContent = "비밀번호 변경에 실패했습니다";
                toast.classList.add('show');
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            }
        }
    });

    // 초기 버튼 상태 설정
    updateSubmitButton();
});