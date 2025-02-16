// login.js
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
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.email === email && user.password === password);
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

        const email = emailInput.value;
        const password = passwordInput.value;

        // localStorage에서 사용자 확인
        const user = validateLogin(email, password);
        
        if (user) {
            // 로그인 성공
            console.log('로그인 성공:', user);
            window.location.href = 'post.html'; // 게시글 목록 페이지로 이동
        } else {
            // 로그인 실패
            emailHelper.textContent = '* 아이디 또는 비밀번호를 확인해주세요';
            emailHelper.style.color = 'red';
            passwordHelper.textContent = '';
        }
    });

    // 초기 버튼 상태 설정
    updateButtonState();
});