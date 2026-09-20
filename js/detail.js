import { DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked, showToast } from './common.js';

initCommonUI();

const params = new URLSearchParams(window.location.search);
const destId = params.get('id');

const item = DESTINATIONS.find(d => d.id === destId) || DESTINATIONS[0];

if (!item) {
  alert('존재하지 않는 여행지입니다.');
  window.location.href = 'index.html';
}

document.title = `${item.title} - optvoyage`;
document.getElementById('headerDetailTitle').textContent = item.title;
document.getElementById('detailImg').src = item.image;
document.getElementById('detailCategoryBadge').textContent = item.category.split('/')[0];
document.getElementById('detailTitle').textContent = item.title;
document.getElementById('detailRating').textContent = item.rating;
document.getElementById('detailReviewCount').textContent = item.reviewCount.toLocaleString();
document.getElementById('detailRegion').textContent = item.region;
document.getElementById('detailDesc').textContent = item.desc;
document.getElementById('detailAddress').textContent = item.address;
document.getElementById('detailTel').textContent = item.tel;

// Gourmet Food
if (item.gourmetInfo) {
  document.getElementById('foodName').textContent = item.gourmetInfo.recommended;
  document.getElementById('foodMenu').textContent = item.gourmetInfo.specialty;
  document.getElementById('foodPrice').textContent = item.gourmetInfo.avgPrice;
} else {
  document.getElementById('foodSection').style.display = 'none';
}

// Stay Info
if (item.stayInfo) {
  document.getElementById('stayPriceRange').textContent = item.stayInfo.priceRange;
  document.getElementById('stayType').textContent = item.stayInfo.type;
} else {
  document.getElementById('staySection').style.display = 'none';
}

// Pet Info
const petBox = document.getElementById('petBox');
if (item.petInfo) {
  petBox.innerHTML = `
    <div style="margin-bottom: 4px;"><strong>동반 가능 여부:</strong> ${item.petInfo.allowed ? '✅ 동반 가능' : '❌ 일반 출입 제한 (시각장애인 안내견 제외)'}</div>
    <div style="margin-bottom: 4px;"><strong>허용 견종/크기:</strong> ${item.petInfo.size}</div>
    <div><strong>이용 수칙:</strong> ${item.petInfo.rules}</div>
  `;
}

// Barrier Free
const bfBox = document.getElementById('bfBox');
if (item.barrierFree) {
  bfBox.innerHTML = `
    <div style="margin-bottom: 6px;"><strong>편의시설 안내:</strong> ${item.barrierFree.details}</div>
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      ${item.barrierFree.ramp ? '<span class="card-tag-pill" style="background:#c7d2fe; color:#312e81;">경사로 완비</span>' : ''}
      ${item.barrierFree.parking ? '<span class="card-tag-pill" style="background:#c7d2fe; color:#312e81;">장애인 주차구역</span>' : ''}
      ${item.barrierFree.toilet ? '<span class="card-tag-pill" style="background:#c7d2fe; color:#312e81;">전용 화장실</span>' : ''}
    </div>
  `;
}

// Tags
const tagsGrid = document.getElementById('detailTagsGrid');
item.tags.forEach(tag => {
  const chip = document.createElement('a');
  chip.href = `search.html?tag=${encodeURIComponent(tag)}`;
  chip.className = 'tag-chip';
  chip.textContent = `#${tag}`;
  tagsGrid.appendChild(chip);
});

// Map Link
const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.title + ' ' + item.address)}`;
document.getElementById('kakaoMapLink').href = kakaoMapUrl;

// Bookmark
const bottomBookmarkBtn = document.getElementById('bottomBookmarkBtn');
function updateBookmarkUI() {
  const bookmarked = isBookmarked(item.id);
  bottomBookmarkBtn.classList.toggle('active', bookmarked);
  bottomBookmarkBtn.querySelector('i').className = bookmarked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}
updateBookmarkUI();

bottomBookmarkBtn.addEventListener('click', () => {
  toggleBookmark(item.id);
  updateBookmarkUI();
});

// Share
function shareCurrentUrl() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`${item.title} - optvoyage에서 확인해보세요! ${url}`)
      .then(() => showToast('✨ 상세 링크가 클립보드에 복사되었습니다!'))
      .catch(() => showToast('링크가 준비되었습니다.'));
  }
}
document.getElementById('bottomShareBtn').addEventListener('click', shareCurrentUrl);
document.getElementById('detailShareTopBtn').addEventListener('click', shareCurrentUrl);
