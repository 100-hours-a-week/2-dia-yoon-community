// API 기본 설정
const API_URL = 'http://localhost:8080/api';

// 인증 토큰 가져오기
function getAuthToken() {
    return sessionStorage.getItem('token');
}

// 공통 헤더 가져오기
function getHeaders(includeAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
}

// API 요청 함수
async function fetchAPI(endpoint, options = {}) {
    try {
        const url = `${API_URL}${endpoint}`;
        
        // 기본 헤더 설정
        if (!options.headers) {
            options.headers = getHeaders(options.auth !== false);
        }
        
        // auth 옵션 제거 (fetch에서 사용되지 않음)
        if (options.auth !== undefined) {
            delete options.auth;
        }
        
        const response = await fetch(url, options);
        
        // 401 Unauthorized 처리
        if (response.status === 401) {
            // 토큰 제거 및 로그인 페이지로 리디렉션
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            
            if (window.location.pathname.indexOf('/auth/login') === -1) {
                window.location.href = '../../auth/login/login.html';
                return null;
            }
        }
        
        // 오류 응답 처리
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
        }
        
        // 응답이 없는 경우 (204 No Content)
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 인증 관련 API
const authAPI = {
    // 로그인
    login: (credentials) => {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            auth: false
        });
    },
    
    // 회원가입
    register: (userData) => {
        return fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    },
    
    // 이메일 중복 확인
    checkEmail: (email) => {
        return fetchAPI(`/auth/check-email?email=${encodeURIComponent(email)}`, {
            auth: false
        });
    },
    
    // 닉네임 중복 확인
    checkNickname: (nickname) => {
        return fetchAPI(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`, {
            auth: false
        });
    }
};

// 사용자 관련 API
const userAPI = {
    // 사용자 정보 가져오기
    getProfile: () => {
        return fetchAPI('/users/profile');
    },
    
    // 사용자 정보 업데이트
    updateProfile: (profileData) => {
        return fetchAPI('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },
    
    // 비밀번호 변경
    changePassword: (passwordData) => {
        return fetchAPI('/users/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    },
    
    // 회원 탈퇴
    deleteAccount: () => {
        return fetchAPI('/users/account', {
            method: 'DELETE'
        });
    }
};

// 게시글 관련 API
const postAPI = {
    // 게시글 목록 가져오기
    getPosts: (page = 1, size = 10) => {
        return fetchAPI(`/posts?page=${page}&size=${size}`);
    },
    
    // 게시글 상세 가져오기
    getPostById: (id) => {
        return fetchAPI(`/posts/${id}`);
    },
    
    // 게시글 작성
    createPost: (postData) => {
        console.log('게시글 작성 API 요청 데이터:', postData);
        return fetchAPI('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },
    
    // 게시글 수정
    updatePost: (id, postData) => {
        return fetchAPI(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },
    
    // 게시글 삭제
    deletePost: (id) => {
        return fetchAPI(`/posts/${id}`, {
            method: 'DELETE'
        });
    },
    
    // 게시글 좋아요
    likePost: (id) => {
        return fetchAPI(`/posts/${id}/like`, {
            method: 'POST'
        });
    },
    
    // 게시글 좋아요 취소
    unlikePost: (id) => {
        return fetchAPI(`/posts/${id}/unlike`, {
            method: 'POST'
        });
    }
};

// 댓글 관련 API
const commentAPI = {
    // 댓글 목록 가져오기
    getComments: (postId) => {
        return fetchAPI(`/posts/${postId}/comments`);
    },
    
    // 댓글 작성
    createComment: (postId, commentData) => {
        return fetchAPI(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    },
    
    // 댓글 수정
    updateComment: (commentId, commentData) => {
        return fetchAPI(`/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify(commentData)
        });
    },
    
    // 댓글 삭제
    deleteComment: (commentId) => {
        return fetchAPI(`/comments/${commentId}`, {
            method: 'DELETE'
        });
    }
};