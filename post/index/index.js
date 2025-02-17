// 드롭다운 메뉴 관련 요소
const profileDropdown = document.getElementById('profileDropdown');
const menuList = document.getElementById('menuList');

// 드롭다운 메뉴 토글
profileDropdown.addEventListener('click', function(e) {
    menuList.classList.toggle('show');
    e.stopPropagation();
});

// 다른 곳 클릭시 드롭다운 닫기
document.addEventListener('click', function() {
    menuList.classList.remove('show');
});