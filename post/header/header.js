document.addEventListener('DOMContentLoaded', function() {
    console.log("헤더 JS 로딩 시작");
    
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

    // 사용자 정보 표시 함수 - 가장 단순한 버전
    function displayUserInfo() {
        try {
            // 현재 사용자 정보 가져오기
            const currentUserStr = localStorage.getItem('currentUser');
            if (!currentUserStr) {
                console.error('사용자 데이터가 localStorage에 없음');
                return;
            }
            
            const currentUser = JSON.parse(currentUserStr);
            console.log('사용자 데이터:', currentUser);
            
            // 프로필 이미지 요소 찾기
            const profileImg = document.getElementById('profileDropdown');
            if (!profileImg) {
                console.error('프로필 이미지 요소를 찾을 수 없음');
                return;
            }
            
            // 프로필 이미지 설정 (단순 직접 할당)
            if (currentUser.profileImage) {
                profileImg.src = currentUser.profileImage;
                console.log('프로필 이미지 설정됨:', currentUser.profileImage.substring(0, 50) + '...');
            } else {
                profileImg.src = '../../images/default-profile.png';
                console.log('기본 프로필 이미지 설정');
            }
            
            // 이미지 로드 오류 시 기본 이미지로 대체
            profileImg.onerror = function() {
                console.error('이미지 로드 실패');
                this.src = '../../images/default-profile.png';
                this.onerror = null; // 무한 로드 방지
            };
        } catch (error) {
            console.error('프로필 표시 오류:', error);
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
        console.log("헤더 초기화 시작");
        // 헤더 HTML 삽입
        insertHeaderHTML();
        
        // 이벤트 리스너 설정
        setupHeaderEvents();
        
        // 사용자 정보 표시
        displayUserInfo();
        
        // 지연 로드 추가 (페이지가 완전히 로드된 후 다시 시도)
        setTimeout(function() {
            console.log("페이지 로드 후 프로필 다시 시도");
            displayUserInfo();
        }, 500);
    }

    // 헤더 초기화 실행
    initHeader();

    // 헤더 관련 함수를 전역으로 노출 (다른 스크립트에서 호출할 수 있도록)
    window.headerUtils = {
        checkLogin: checkLogin,
        displayUserInfo: displayUserInfo,
        initHeader: initHeader,
        // 외부에서 호출할 수 있는 프로필 갱신 함수 추가
        refreshProfile: function() {
            console.log("프로필 새로고침 함수 호출됨");
            displayUserInfo();
            // 지연 후 다시 시도 (이미지 로드 문제 해결을 위해)
            setTimeout(displayUserInfo, 300);
        }
    };
    
    console.log("헤더 JS 로딩 완료");
});