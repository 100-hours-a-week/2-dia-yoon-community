document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 선택
    const registerForm = document.querySelector('.register-form');
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('preview');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const nicknameInput = document.getElementById('nickname');
    const registerButton = document.querySelector('.register-button');
    const backButton = document.getElementById('backToLogin');
    const backToLoginButton = document.querySelector('.back-to-login');
    
    // Helper Text 요소 선택
    const profileHelperText = document.querySelector('.profile-upload .helper-text');
    const emailHelperText = emailInput.parentElement.querySelector('.helper-text');
    const passwordHelperText = passwordInput.parentElement.querySelector('.helper-text');
    const passwordConfirmHelperText = passwordConfirmInput.parentElement.querySelector('.helper-text');
    const nicknameHelperText = nicknameInput.parentElement.querySelector('.helper-text');

    // 이메일 유효성 검사 함수
    async function isValidEmail(email) {
        if (!email) {
            return {
                isValid: false,
                message: "* 이메일을 입력해주세요"
            };
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                message: "* 올바른 이메일 주소를 입력해주세요 (예 : example@example.com)"
            };
        }

        // 이메일 중복 검사
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const isEmailDuplicate = users.some(user => user.email === email);
        if (isEmailDuplicate) {
            return {
                isValid: false,
                message: "* 중복된 이메일입니다."
            };
        }

        return {
            isValid: true,
            message: "* 사용 가능한 이메일입니다"
        };
    }

    // 비밀번호 유효성 검사 함수
    function isValidPassword(password) {
        if (!password) {
            return {
                isValid: false,
                message: "* 비밀번호를 입력해주세요"
            };
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        if (!passwordRegex.test(password)) {
            return {
                isValid: false,
                message: "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다"
            };
        }

        return {
            isValid: true,
            message: "* 사용 가능한 비밀번호입니다"
        };
    }

    // 닉네임 유효성 검사 함수
    async function isValidNickname(nickname) {
        if (!nickname) {
            return {
                isValid: false,
                message: "* 닉네임을 입력해주세요"
            };
        }

        if (nickname.includes(' ')) {
            return {
                isValid: false,
                message: "* 띄어쓰기를 없애주세요"
            };
        }

        if (nickname.length > 10) {
            return {
                isValid: false,
                message: "* 닉네임은 최대 10자까지 가능합니다"
            };
        }

        // 닉네임 중복 검사
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const isNicknameDuplicate = users.some(user => user.nickname === nickname);
        if (isNicknameDuplicate) {
            return {
                isValid: false,
                message: "* 중복된 닉네임입니다"
            };
        }

        return {
            isValid: true,
            message: "* 사용 가능한 닉네임입니다"
        };
    }

    // 버튼 상태 업데이트 함수
    function updateButtonState() {
        const hasProfile = profileUpload.files && profileUpload.files.length > 0;
        const isEmailValid = emailHelperText.style.color === 'green';
        const isPasswordValid = passwordHelperText.style.color === 'green';
        const isPasswordConfirmValid = passwordConfirmHelperText.style.color === 'green';
        const isNicknameValid = nicknameHelperText.style.color === 'green';

        if (hasProfile && isEmailValid && isPasswordValid && isPasswordConfirmValid && isNicknameValid) {
            registerButton.style.backgroundColor = '#7F6AEE';
            registerButton.disabled = false;
        } else {
            registerButton.style.backgroundColor = '#ACA0EB';
            registerButton.disabled = true;
        }

        // 디버깅용 콘솔 로그
        console.log('Button State Check:', {
            hasProfile,
            isEmailValid,
            isPasswordValid,
            isPasswordConfirmValid,
            isNicknameValid
        });
    }

    // 이메일 입력 이벤트
    emailInput.addEventListener('input', async function() {
        const validationResult = await isValidEmail(this.value);
        emailHelperText.textContent = validationResult.message;
        emailHelperText.style.color = validationResult.isValid ? 'green' : 'red';
        updateButtonState();
    });

    // 비밀번호 입력 이벤트
    passwordInput.addEventListener('input', function() {
        const validationResult = isValidPassword(this.value);
        passwordHelperText.textContent = validationResult.message;
        passwordHelperText.style.color = validationResult.isValid ? 'green' : 'red';
        
        // 비밀번호 확인 필드가 비어있지 않은 경우 일치 여부 검사
        if (passwordConfirmInput.value) {
            const isMatch = this.value === passwordConfirmInput.value;
            passwordConfirmHelperText.textContent = isMatch ? "* 비밀번호가 일치합니다" : "* 비밀번호가 다릅니다";
            passwordConfirmHelperText.style.color = isMatch ? 'green' : 'red';
        }
        
        updateButtonState();
    });

    // 비밀번호 확인 입력 이벤트
    passwordConfirmInput.addEventListener('input', function() {
        if (!this.value) {
            passwordConfirmHelperText.textContent = "* 비밀번호를 한번 더 입력해주세요";
            passwordConfirmHelperText.style.color = 'red';
        } else if (this.value !== passwordInput.value) {
            passwordConfirmHelperText.textContent = "* 비밀번호가 다릅니다";
            passwordConfirmHelperText.style.color = 'red';
        } else {
            passwordConfirmHelperText.textContent = "* 비밀번호가 일치합니다";
            passwordConfirmHelperText.style.color = 'green';
        }
        updateButtonState();
    });

    // 닉네임 입력 이벤트
    nicknameInput.addEventListener('input', async function() {
        const validationResult = await isValidNickname(this.value);
        nicknameHelperText.textContent = validationResult.message;
        nicknameHelperText.style.color = validationResult.isValid ? 'green' : 'red';
        updateButtonState();
    });

    // 프로필 이미지 업로드
    profileUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePreview.src = e.target.result;
                profileHelperText.textContent = "* 프로필 사진이 추가되었습니다";
                profileHelperText.style.color = 'green';
            };
            reader.readAsDataURL(file);
        } else {
            profileHelperText.textContent = "* 프로필 사진을 추가해주세요";
            profileHelperText.style.color = 'red';
        }
        updateButtonState();
    });

    // 프로필 이미지 클릭 이벤트
    profilePreview.addEventListener('click', function() {
        profileUpload.click();
    });

    // 뒤로가기 버튼 이벤트
    backButton.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    // 로그인하러 가기 버튼 이벤트
    backToLoginButton.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    // 폼 제출 이벤트
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const nickname = nicknameInput.value;
        const profileImage = profilePreview.src;

        // 최종 유효성 검사
        const emailValidation = await isValidEmail(email);
        const passwordValidation = isValidPassword(password);
        const nicknameValidation = await isValidNickname(nickname);

        if (!emailValidation.isValid || !passwordValidation.isValid || !nicknameValidation.isValid) {
            return;
        }

        // 사용자 정보 저장
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({
            email,
            password,
            nickname,
            profileImage
        });
        localStorage.setItem('users', JSON.stringify(users));

        // 로그인 페이지로 이동
        window.location.href = '../login/login.html';
    });

    // 초기 상태 체크
    updateButtonState();
});