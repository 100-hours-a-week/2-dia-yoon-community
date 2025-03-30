// 사용자 프로필 이미지 표시 함수
function displayUserProfileImage(imgElement) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser && currentUser.profileImage) {
            // Base64 이미지인지 확인
            if (currentUser.profileImage.startsWith('data:image')) {
                imgElement.src = currentUser.profileImage;
            } else {
                // URL 형식이면 그대로 사용
                imgElement.src = currentUser.profileImage;
            }
        } else {
            // 기본 이미지 설정
            imgElement.src = '/images/default-profile.png';
        }
    } catch (error) {
        console.error('프로필 이미지 표시 중 오류:', error);
        imgElement.src = '/images/default-profile.png';
    }
}

// 작성자 프로필 이미지 표시 함수
function displayAuthorProfileImage(imgElement, authorImage) {
    try {
        if (authorImage) {
            // Base64 이미지인지 확인
            if (authorImage.startsWith('data:image')) {
                imgElement.src = authorImage;
            } else {
                // URL 형식이면 그대로 사용
                imgElement.src = authorImage;
            }
        } else {
            // 기본 이미지 설정
            imgElement.src = '/images/default-profile.png';
        }
    } catch (error) {
        console.error('작성자 프로필 이미지 표시 중 오류:', error);
        imgElement.src = '/images/default-profile.png';
    }
}

// 이미지 압축 함수
function compressImage(imgFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imgFile);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                // 크기 조정
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;
                
                // 비율 유지하면서 크기 조정
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
                
                // 압축 (70% 품질)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                // 이미지 크기 확인 (대략적인 계산)
                const base64Length = compressedDataUrl.length - 'data:image/jpeg;base64,'.length;
                const sizeInBytes = base64Length * 0.75;
                const sizeInKB = sizeInBytes / 1024;
                
                console.log(`압축된 이미지 크기: 약 ${sizeInKB.toFixed(2)}KB`);
                
                // 만약 크기가 100KB보다 크면 추가 압축 수행
                if (sizeInKB > 100) {
                    console.log('이미지가 여전히 너무 큽니다. 추가 압축 수행...');
                    // 더 작은 크기로 다시 압축
                    const smallerCanvas = document.createElement('canvas');
                    const SMALLER_MAX = 200;
                    let smallerWidth = width;
                    let smallerHeight = height;
                    
                    if (smallerWidth > smallerHeight) {
                        if (smallerWidth > SMALLER_MAX) {
                            smallerHeight *= SMALLER_MAX / smallerWidth;
                            smallerWidth = SMALLER_MAX;
                        }
                    } else {
                        if (smallerHeight > SMALLER_MAX) {
                            smallerWidth *= SMALLER_MAX / smallerHeight;
                            smallerHeight = SMALLER_MAX;
                        }
                    }
                    
                    smallerCanvas.width = smallerWidth;
                    smallerCanvas.height = smallerHeight;
                    const smallerCtx = smallerCanvas.getContext('2d');
                    smallerCtx.drawImage(img, 0, 0, smallerWidth, smallerHeight);
                    
                    // 더 낮은 품질로 압축 (50% 품질)
                    resolve(smallerCanvas.toDataURL('image/jpeg', 0.5));
                } else {
                    resolve(compressedDataUrl);
                }
            };
            img.onerror = function() {
                reject(new Error('이미지 로드 실패'));
            };
        };
        reader.onerror = function() {
            reject(new Error('파일 읽기 실패'));
        };
    });
}