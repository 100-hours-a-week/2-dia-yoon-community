// 드롭다운 메뉴 관련 요소
const profileDropdown = document.getElementById('profileDropdown');
const menuList = document.getElementById('menuList');

// 폼 요소들
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordHelper = document.getElementById('passwordHelper');
const confirmPasswordHelper = document.getElementById('confirmPasswordHelper');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');

// 유효성 검사 상태
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
        confirmPasswordHelper.textContent = "* 비밀번호와 다릅니다";
        confirmPasswordHelper.style.display = "block";
        return false;
    }

    confirmPasswordHelper.style.display = "none";
    return true;
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

// 수정하기 버튼 클릭 이벤트
submitBtn.addEventListener('click', function() {
    if (isPasswordValid && isConfirmPasswordValid) {
        toast.textContent = "수정 완료";
        toast.classList.add('show');
        
        // 2초 후 토스트 메시지 숨기기
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
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

// 초기 버튼 상태 설정
updateSubmitButton();