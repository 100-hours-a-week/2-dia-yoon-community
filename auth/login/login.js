document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailHelper = emailInput.parentElement.querySelector('.helper-text');
    const passwordHelper = passwordInput.parentElement.querySelector('.helper-text');
    const loginButton = document.querySelector('.login-button');
    
    // API URL을 스프링부트 백엔드 주소로 설정
    const API_URL = 'http://localhost:8080/api';

    // 이메일 유효성 검사 함수
    function isValidEmail(email) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    }

    // 사용자 프로필 정보 가져오기 함수 (추가된 함수)
    async function fetchUserProfile(token, basicUserInfo) {
        try {
            console.log('사용자 프로필 정보 요청 시작');
            
            // 사용자 ID 또는 이메일로 프로필 정보 요청
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.warn('프로필 정보 요청 실패:', response.status);
                return basicUserInfo; // 실패 시 기본 정보 반환
            }
            
            const profileData = await response.json();
            console.log('프로필 정보 응답:', profileData);
            
            // 응답 구조에 따른 데이터 추출
            let userProfile = profileData;
            if (profileData.data) {
                userProfile = profileData.data;
            }
            
            // 기본 사용자 정보와 프로필 정보 병합
            const mergedUserInfo = {
                ...basicUserInfo,
                nickname: userProfile.nickname || basicUserInfo.nickname,
                profileImage: userProfile.profileImage || basicUserInfo.profileImage,
                // 다른 필요한 필드 추가
            };
            
            console.log('병합된 사용자 정보:', mergedUserInfo);
            return mergedUserInfo;
            
        } catch (error) {
            console.error('프로필 정보 요청 중 오류:', error);
            return basicUserInfo; // 오류 발생 시 기본 정보 반환
        }
    }

    // Fetch API를 사용한 로그인 검증 함수
    async function validateLogin(email, password) {
        console.error("로그인 함수 시작");

        try {
            console.log('API 로그인 시도:', email);
            
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                credentials: 'include', // 쿠키 포함 설정 추가
                cache: 'no-store',
                body: JSON.stringify({ email, password })
            });
            
            console.log('API 응답 상태:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('인증 실패: 이메일 또는 비밀번호가 올바르지 않습니다.');
                    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
                } else {
                    const errorText = await response.text();
                    console.error('로그인 실패 응답:', errorText);
                    throw new Error(`로그인 실패: ${response.status}`);
                }
            }
            
            const data = await response.json();
            console.log('API 응답 데이터:', data);
            
            // 백엔드 응답 구조에 따라 토큰 추출
            let token = null;
            let userData = {};
            
            // 응답 구조 분석
            if (data.data && data.data.token) {
                console.log("로그인 전체 응답 : ", data);
                token = data.data.token;
                userData = {
                    id: data.data.userId || data.data.id,
                    email: data.data.email || email,
                    nickname: data.data.nickname || email.split('@')[0],
                    profileImage: data.data.profileImage || null
                };
            } else if (data.token) {
                token = data.token;
                userData = {
                    id: data.userId || data.id,
                    email: data.email || email,
                    nickname: data.nickname || email.split('@')[0],
                    profileImage: data.profileImage || null
                };
                console.log("로그인 시 추출된 데이터 : ", userData);
            } else {
                // 응답 구조가 예상과 다를 경우 데이터 구조 로깅
                console.warn('예상치 못한 응답 구조:', data);
                
                // 다양한 응답 형식 지원을 위한 확장 코드
                if (typeof data === 'object') {
                    // 중첩된 객체에서 토큰 찾기
                    const findTokenInObject = (obj, depth = 0) => {
                        if (depth > 3) return null; // 재귀 깊이 제한
                        
                        if (obj.token) return obj.token;
                        
                        for (const key in obj) {
                            if (typeof obj[key] === 'object' && obj[key] !== null) {
                                const foundToken = findTokenInObject(obj[key], depth + 1);
                                if (foundToken) return foundToken;
                            }
                        }
                        return null;
                    };
                    
                    token = findTokenInObject(data);
                    
                    // 기본 사용자 데이터 구성
                    userData = {
                        email: email,
                        nickname: email.split('@')[0]
                    };
                    
                    // 가능한 ID 필드들 확인
                    if (data.id) userData.id = data.id;
                    else if (data.userId) userData.id = data.userId;
                    else if (data.user_id) userData.id = data.user_id;
                    else userData.id = Date.now().toString(); // 임시 ID
                    
                    // 프로필 이미지 필드 확인
                    if (data.profileImage) userData.profileImage = data.profileImage;
                    else if (data.profile_image) userData.profileImage = data.profile_image;
                    else if (data.avatar) userData.profileImage = data.avatar;
                }
            }
            
            // 토큰 저장
            if (token) {
                console.log('토큰 저장됨:', token);
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                
                // 프로필 정보 요청 추가 (새로운 부분)
                const fullUserData = await fetchUserProfile(token, userData);
                return fullUserData;
            } else {
                console.error('토큰을 찾을 수 없음:', data);
                throw new Error('응답에서 토큰을 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('API 로그인 검증 중 에러 발생:', error);
            
            // API 호출 실패 시 localStorage로 폴백 (개발용)
            console.log('localStorage로 폴백 로그인 시도');
            console.log('현재 저장된 users:', localStorage.getItem('users'));
            
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                console.log('파싱된 users:', users);
                
                const user = users.find(user => user.email === email && user.password === password);
                console.log('찾은 user:', user);
                
                if (user) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    
                    // 테스트용 가짜 토큰 생성 (개발 중에만 사용)
                    const mockToken = `dev-token-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    sessionStorage.setItem('token', mockToken);
                    
                    return user;
                }
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            } catch (localError) {
                console.error('localStorage 로그인 검증 중 에러 발생:', localError);
                throw error; // 원래 API 오류를 그대로 던짐
            }
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

    // 세션 저장소 초기화 (이전 로그인 정보 삭제)
    function clearSessionData() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
    }

    // 폼 제출 이벤트
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        loginButton.disabled = true;
        loginButton.textContent = '로그인 중...'; // 로딩 상태 표시

        const email = emailInput.value;
        const password = passwordInput.value;

        // 기존 세션 초기화
        clearSessionData();

        try {
            // 로그인 시도 중인 정보 출력
            console.log('로그인 시도:', { email });
            
            const user = await validateLogin(email, password);
            
            if (user) {
                console.log('로그인 성공:', user);
                
                // 사용자 정보 로컬 스토리지에 저장
                const userToStore = {
                    id: user.id || user.userId,
                    email: user.email,
                    nickname: user.nickname || user.authorName || email.split('@')[0],
                    profileImage: user.profileImage
                };
                
                // 로그인 상태 확인
                const token = sessionStorage.getItem('token');
                const isLoggedIn = sessionStorage.getItem('isLoggedIn');
                
                console.log('로그인 후 상태 확인:', {
                    token: token ? '존재함' : '없음',
                    isLoggedIn: isLoggedIn,
                    userData: userToStore
                });
                
                if (!token || !isLoggedIn) {
                    console.error('로그인은 성공했으나 인증 정보가 없습니다.');
                    alert('로그인은 성공했으나 인증 정보 저장에 문제가 발생했습니다. 다시 시도해주세요.');
                    loginButton.disabled = false;
                    loginButton.textContent = '로그인';
                    return;
                }
                
                // 최종 사용자 정보 저장
                localStorage.setItem('currentUser', JSON.stringify(userToStore));
                
                // 로그인 성공 후 메인 페이지로 이동
                alert('로그인에 성공했습니다.');
                window.location.href = '../../post/index/index.html';
            } else {
                // user가 null인 경우 처리
                emailHelper.textContent = '* 로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
                emailHelper.style.color = 'red';
                loginButton.disabled = false;
                loginButton.textContent = '로그인';
            }
        } catch (error) {
            console.error('로그인 처리 중 에러 발생:', error);
            emailHelper.textContent = '* ' + (error.message || '로그인 중 오류가 발생했습니다.');
            emailHelper.style.color = 'red';
            loginButton.disabled = false;
            loginButton.textContent = '로그인';
        }
    });

    // 초기 버튼 상태 설정
    updateButtonState();
});