// profile.js
document.addEventListener('DOMContentLoaded', function() {
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

    // 드롭다운 메뉴 토글
    profileDropdown.addEventListener('click', function(e) {
        menuList.classList.toggle('show');
        e.stopPropagation();
    });

    // 다른 곳 클릭시 드롭다운 닫기
    document.addEventListener('click', function() {
        menuList.classList.remove('show');
    });

    // 가상의 중복 닉네임 체크 함수 (실제로는 서버 통신이 필요)
    function checkNicknameDuplicate(nickname) {
        // 예시로 "test"라는 닉네임이 이미 존재한다고 가정
        return nickname === "test";
    }

    // 닉네임 유효성 검사
    function validateNickname() {
        const nickname = nicknameInput.value.trim();
        
        // 닉네임 미입력
        if (nickname === '') {
            nicknameHelper.textContent = '* 닉네임을 입력해주세요';
            return false;
        }
        
        // 닉네임 길이 체크 (10자 제한)
        if (nickname.length > 10) {
            nicknameHelper.textContent = '* 닉네임은 최대 10자까지 작성 가능합니다';
            return false;
        }
        
        // 닉네임 중복 체크
        if (checkNicknameDuplicate(nickname)) {
            nicknameHelper.textContent = '* 중복된 닉네임입니다';
            return false;
        }

        // 모든 검사 통과
        nicknameHelper.textContent = '';
        return true;
    }

    // 수정하기 버튼 클릭 이벤트
    submitBtn.addEventListener('click', function() {
        if (validateNickname()) {
            // 토스트 메시지 표시
            toast.classList.add('show');
            
            // 2초 후 토스트 메시지 제거
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
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
        // 여기에 회원 탈퇴 처리 로직 추가
        console.log('회원 탈퇴 처리');
        withdrawModal.classList.remove('show');
    });

    // 모달 외부 클릭 시 모달 닫기
    withdrawModal.addEventListener('click', function(e) {
        if (e.target === withdrawModal) {
            withdrawModal.classList.remove('show');
        }
    });

    // ESC 키 누를 때 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && withdrawModal.classList.contains('show')) {
            withdrawModal.classList.remove('show');
        }
    });
});