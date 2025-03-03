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

    // 초기 헬퍼 텍스트 설정
    profileHelperText.textContent = "* 프로필 사진을 추가해주세요";
    emailHelperText.textContent = "* 이메일을 입력해주세요";
    passwordHelperText.textContent = "* 비밀번호를 입력해주세요";
    passwordConfirmHelperText.textContent = "* 비밀번호를 한번 더 입력해주세요";
    nicknameHelperText.textContent = "* 닉네임을 입력해주세요";

    // 이메일 유효성 검사 함수
    function isValidEmail(email) {
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
    function isValidNickname(nickname) {
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
        // 모든 입력 필드의 유효성 검사
        const emailResult = isValidEmail(emailInput.value);
        const passwordResult = isValidPassword(passwordInput.value);
        const passwordsMatch = passwordInput.value === passwordConfirmInput.value && passwordInput.value !== '';
        const nicknameResult = isValidNickname(nicknameInput.value);
        
        // 프로필 이미지 선택 여부 (기본 이미지도 허용)
        const hasProfile = true; // 기본 이미지도 허용
        
        console.log('Button State Check:', {
            hasProfile,
            emailValid: emailResult.isValid,
            passwordValid: passwordResult.isValid,
            passwordsMatch,
            nicknameValid: nicknameResult.isValid
        });

        // 모든 조건이 충족되면 버튼 활성화
        if (hasProfile && emailResult.isValid && passwordResult.isValid && 
            passwordsMatch && nicknameResult.isValid) {
            registerButton.style.backgroundColor = '#7F6AEE';
            registerButton.disabled = false;
        } else {
            registerButton.style.backgroundColor = '#ACA0EB';
            registerButton.disabled = true;
        }
    }

    // 이메일 입력 이벤트
    emailInput.addEventListener('input', function() {
        const validationResult = isValidEmail(this.value);
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
    nicknameInput.addEventListener('input', function() {
        const validationResult = isValidNickname(this.value);
        nicknameHelperText.textContent = validationResult.message;
        nicknameHelperText.style.color = validationResult.isValid ? 'green' : 'red';
        updateButtonState();
    });

    // 프로필 이미지 업로드
    profilePreview.addEventListener('click', function() {
        profileUpload.click();
    });
    
    // 프로필 이미지 업로드
profileUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 이미지 크기 줄이기
            const img = new Image();
            img.onload = function() {
                // 캔버스를 사용해 이미지 크기 조정
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;
                
                // 비율 유지하면서 크기 줄이기
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
                
                // 압축된 이미지로 대체
                const compressedImageData = canvas.toDataURL('image/jpeg', 0.7); // 70% 품질로 JPEG 압축
                profilePreview.src = compressedImageData;
                profileHelperText.textContent = "* 프로필 사진이 추가되었습니다";
                profileHelperText.style.color = 'green';
                updateButtonState();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        profileHelperText.textContent = "* 프로필 사진을 추가해주세요";
        profileHelperText.style.color = 'red';
        updateButtonState();
    }
});

    // 뒤로가기 버튼 이벤트
    backButton.addEventListener('click', function() {
        window.location.href = '../login/login.html';
    });

    // 로그인하러 가기 버튼 이벤트
    backToLoginButton.addEventListener('click', function() {
        window.location.href = '../login/login.html';
    });

    // 폼 제출 이벤트
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Form submitted');

        const email = emailInput.value;
        const password = passwordInput.value;
        const nickname = nicknameInput.value;
        const profileImage = profilePreview.src;

        // 최종 유효성 검사
        const emailValidation = isValidEmail(email);
        const passwordValidation = isValidPassword(password);
        const nicknameValidation = isValidNickname(nickname);
        const passwordsMatch = password === passwordConfirmInput.value;

        if (!emailValidation.isValid || !passwordValidation.isValid || 
            !nicknameValidation.isValid || !passwordsMatch) {
            console.log('Validation failed', { 
                email: emailValidation, 
                password: passwordValidation,
                nickname: nicknameValidation,
                passwordsMatch 
            });
            return;
        }

        try {
            // 현재 users 배열 가져오기
            let users = [];
            try {
                const usersJSON = localStorage.getItem('users');
                if (usersJSON) {
                    users = JSON.parse(usersJSON);
                }
            } catch (e) {
                console.error('Failed to parse users from localStorage:', e);
                users = [];
            }

            // 사용자 정보 추가
            const newUser = {
                email,
                password,
                nickname,
                profileImage,
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            console.log('Saving user:', newUser);
            console.log('All users:', users);
            
            // localStorage에 저장
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Users saved to localStorage');
            
            // 로그인 페이지로 이동
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            window.location.href = '../login/login.html';
        } catch (error) {
            console.error('회원가입 처리 중 오류 발생:', error);
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
        }
    });

    // 초기 상태 체크
    updateButtonState();
});