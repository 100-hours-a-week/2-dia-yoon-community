document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크 함수
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

    // 헤더 HTML 동적 삽입 (페이지별로 다른 헤더가 필요한 경우 사용)
    function insertHeaderHTML() {
        // 현재 페이지 경로 확인
        const currentPath = window.location.pathname;
        
        const headerContainer = document.querySelector('header');
        if (headerContainer) {
            // 이미 헤더 내용이 있는지 확인
            if (headerContainer.innerHTML.trim() === '') {
                const headerContent = `
                    <div class="header-content">
                        <button class="back-btn" id="backBtn">←</button>
                        <div class="header-title">아무 말 대잔치</div>
                        <div class="profile-container">
                            <img src="../../images/default-profile.png" alt="프로필" class="profile-image" id="profileDropdown">
                            <ul class="menu-list" id="menuList">
                                <li>회원정보수정</li>
                                <li>비밀번호수정</li>
                                <li>로그아웃</li>
                            </ul>
                        </div>
                    </div>
                `;
                headerContainer.innerHTML = headerContent;
                
                // 현재 페이지가 index.html이면 뒤로가기 버튼 숨기기
                if (currentPath.includes('/post/index/') || currentPath.endsWith('/post/') || currentPath.endsWith('/post')) {
                    const backBtn = document.getElementById('backBtn');
                    if (backBtn) backBtn.style.display = 'none';
                }
            }
        }
    }

    // 사용자 정보 표시 함수 - 개선된 버전
    function displayUserInfo() {
        console.log('사용자 정보 표시 시도');
        
        try {
            // localStorage에서 사용자 정보 가져오기
            const userDataStr = localStorage.getItem('currentUser');
            console.log('localStorage currentUser:', userDataStr);
            
            if (!userDataStr) {
                console.error('사용자 데이터가 localStorage에 없음');
                return;
            }
            
            const userData = JSON.parse(userDataStr);
            console.log('파싱된 사용자 데이터:', userData);
            
            // 프로필 이미지 요소 찾기
            const profileImg = document.getElementById('profileDropdown');
            
            if (!profileImg) {
                console.error('프로필 이미지 요소를 찾을 수 없음');
                return;
            }
            
            // 루트 경로 계산 - 현재 페이지 깊이에 따라 상대 경로 조정
            const currentPath = window.location.pathname;
            const pathSegments = currentPath.split('/').filter(segment => segment.length > 0);
            
            // 절대 경로로 변환하여 계산
            let rootPath;
            
            // 주요 폴더 구조에 따라 경로 설정
            if (currentPath.includes('/post/index/')) {
                rootPath = '../..'; // /post/index/ 폴더에서는 두 단계 위로
            } else if (currentPath.includes('/post/detail/') || 
                       currentPath.includes('/post/modify/') || 
                       currentPath.includes('/post/write/')) {
                rootPath = '../..'; // /post/detail/, /post/modify/, /post/write/ 폴더에서도 두 단계 위로
            } else if (currentPath.includes('/auth/')) {
                rootPath = '../..'; // /auth/ 하위 폴더에서도 두 단계 위로
            } else {
                // 기본 경로 계산(다른 페이지용)
                const depth = pathSegments.length - 1; // -1은 파일명을 제외
                rootPath = '../'.repeat(depth);
            }
            
            console.log('현재 경로:', currentPath, '폴더 구조 기반 루트 경로:', rootPath);
            
            // 이미지 경로 설정 로직
            let authorImg;
            if (userData.profileImage) {
                const imageSource = userData.profileImage;
                // Base64 이미지 데이터인 경우 직접 사용
                if (imageSource.startsWith('data:image/')) {
                    authorImg = imageSource;
                    console.log('Base64 이미지 사용');
                }
                // 긴 Base64 문자열인 경우(data:image/ 없이 시작하는 경우)
                else if (imageSource.length > 100 && (imageSource.startsWith('/9j/') || imageSource.startsWith('/4AA'))) {
                    authorImg = `data:image/jpeg;base64,${imageSource}`;
                    console.log('Base64 문자열을 이미지로 변환');
                }
                // 절대 경로인 경우 그대로 사용
                else if (imageSource.startsWith('/')) {
                    authorImg = imageSource;
                    console.log('절대 경로 이미지 사용');
                }
                // 상대 경로나 파일명인 경우
                else {
                    // 현재 페이지 깊이에 따라 상대 경로 조정
                    const fileName = imageSource.split('/').pop();
                    // 절대 경로로 처리
                    authorImg = `${rootPath}/images/${fileName}`;
                    console.log('상대 경로로 이미지 설정:', authorImg);
                }
            } else {
                // 이미지 정보가 없으면 기본 이미지
                authorImg = `${rootPath}/images/default-profile.png`;
                console.log('기본 이미지 사용:', authorImg);
            }
            
            console.log('최종 이미지 경로:', authorImg);
            
            // 이미지 소스 설정
            profileImg.src = authorImg;
            
            // 이미지 로딩 실패 시 기본 이미지로 대체
            profileImg.onerror = () => {
                console.error('이미지 로드 실패:', profileImg.src);
                profileImg.src = `${rootPath}/images/default-profile.png`;
                
                // 두 번째 시도도 실패하면 절대 경로로 시도
                profileImg.onerror = () => {
                    console.error('기본 이미지도 로드 실패. 절대 경로 시도:', profileImg.src);
                    profileImg.src = '/images/default-profile.png';
                };
            };
        } catch (error) {
            console.error('프로필 표시 중 오류:', error);
            // 에러 발생 시 기본 이미지 경로 계산 - 절대 경로 사용
            const rootPath = '/images'; // 웹사이트 루트 기준 절대 경로 사용
            
            const profileImg = document.getElementById('profileDropdown');
            if (profileImg) {
                profileImg.src = `/images/default-profile.png`;
            }
        }
    }

    // 헤더 이벤트 리스너 설정
    function setupHeaderEvents() {
        const backBtn = document.getElementById('backBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const menuList = document.getElementById('menuList');
        
        // 뒤로가기 버튼 이벤트
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                // 세부 페이지에서는 index로, 수정 페이지에서는 세부 페이지로
                const currentPath = window.location.pathname;
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('id');
                
                // auth 폴더 내의 페이지(회원정보수정, 비밀번호 변경 등)에서는 index.html로 이동
                if (currentPath.includes('/auth/')) {
                    window.location.href = '../../post/index/index.html';
                } else if (currentPath.includes('/detail/')) {
                    window.location.href = '../index/index.html';
                } else if (currentPath.includes('/modify/') && postId) {
                    window.location.href = `../detail/detail.html?id=${postId}`;
                } else {
                    window.location.href = '../index/index.html';
                }
            });
        }
        
        // 드롭다운 메뉴 토글
        if (profileDropdown) {
            profileDropdown.addEventListener('click', function(e) {
                if (menuList) {
                    menuList.classList.toggle('show');
                    e.stopPropagation();
                }
            });
        }
        
        // 다른 곳 클릭시 드롭다운 닫기
        document.addEventListener('click', function() {
            if (menuList) {
                menuList.classList.remove('show');
            }
        });
        
        // 메뉴 항목 클릭 이벤트
        if (menuList) {
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
        }
    }

    // 헤더 초기화 함수 - 이 함수를 호출하여 헤더를 초기화
    function initHeader() {
        // 헤더 HTML 삽입 (필요한 경우)
        // 대부분의 페이지에서는 HTML이 이미 있으므로 주석 처리
        insertHeaderHTML();
        
        // 이벤트 리스너 설정
        setupHeaderEvents();
        
        // 사용자 정보 표시
        displayUserInfo();
    }

    // 헤더 초기화 실행
    initHeader();

    // 헤더 관련 함수를 전역으로 노출 (다른 스크립트에서 호출할 수 있도록)
    window.headerUtils = {
        checkLogin: checkLogin,
        displayUserInfo: displayUserInfo,
        initHeader : initHeader
    };
});