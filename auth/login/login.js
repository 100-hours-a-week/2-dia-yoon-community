document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailHelper = emailInput.parentElement.querySelector('.helper-text');
    const passwordHelper = passwordInput.parentElement.querySelector('.helper-text');
    const loginButton = document.querySelector('.login-button');

    // 이메일 유효성 검사 함수
    function isValidEmail(email) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    }

    // 로그인 검증 함수
    function validateLogin(email, password) {
        try {
            // localStorage 디버깅
            console.log('현재 저장된 users:', localStorage.getItem('users'));
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            console.log('파싱된 users:', users);
            
            const user = users.find(user => user.email === email && user.password === password);
            console.log('찾은 user:', user);
            
            if (user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                return user;
            }
            return null;
        } catch (error) {
            console.error('로그인 검증 중 에러 발생:', error);
            throw error; // 에러를 상위로 전달
        }
    }

    // 버튼 상태 업데이트
    function updateButtonState() {
        const isEmailValid = isValidEmail(emailInput.value);
        const hasPassword = passwordInput.value.length > 0;
        
        if (isEmailValid && hasPassword) {
            loginButton.style.backgroundColor = '#7F6AEE';
            loginButton.disabled = false;
        } else {
            loginButton.style.backgroundColor = '#ACA0EB';
            loginButton.disabled = true;
        }
    }

    // 이메일 입력 이벤트
    emailInput.addEventListener('input', function() {
        if (!this.value) {
            emailHelper.textContent = '* 이메일을 입력해주세요';
            emailHelper.style.color = 'red';
        } else if (!isValidEmail(this.value)) {
            emailHelper.textContent = '* 올바른 이메일 주소를 입력하세요 예) example@example.com';
            emailHelper.style.color = 'red';
        } else {
            emailHelper.textContent = '';
        }
        updateButtonState();
    });

    // 비밀번호 입력 이벤트
    passwordInput.addEventListener('input', function() {
        if (!this.value) {
            passwordHelper.textContent = '* 비밀번호를 입력해주세요';
            passwordHelper.style.color = 'red';
        } else {
            passwordHelper.textContent = '';
        }
        updateButtonState();
    });

    // 폼 제출 이벤트
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        loginButton.disabled = true;

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            // 로그인 시도 중인 정보 출력
            console.log('로그인 시도:', { email, password });
            
            const user = validateLogin(email, password);
            
            if (user) {
                console.log('로그인 성공:', user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = '../../post/index/index.html';
            } else {
                console.log('로그인 실패: 사용자를 찾을 수 없음');
                emailHelper.textContent = '* 아이디 또는 비밀번호를 확인해주세요';
                emailHelper.style.color = 'red';
                passwordHelper.textContent = '';
                loginButton.disabled = false;
            }
        } catch (error) {
            console.error('로그인 처리 중 에러 발생:', error);
            emailHelper.textContent = '* 로그인 중 오류가 발생했습니다';
            emailHelper.style.color = 'red';
            loginButton.disabled = false;
        }
    });

    // 초기 버튼 상태 설정
    updateButtonState();
});