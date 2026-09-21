import { DESTINATIONS, AFFILIATE_LINKS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked, showToast } from './common.js';

initCommonUI();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id') || 'tour-001';
const item = DESTINATIONS.find(d => d.id === id) || DESTINATIONS[0];

document.getElementById('detailTitle').textContent = item.title;
document.getElementById('headerDetailTitle').textContent = item.title;
document.getElementById('detailCategoryBadge').textContent = item.category;
document.getElementById('detailRating').textContent = item.rating;
document.getElementById('detailReviewCount').textContent = item.reviewCount;
document.getElementById('detailRegion').textContent = item.region;
document.getElementById('detailDesc').textContent = item.desc;
document.getElementById('detailAddress').textContent = item.address;
document.getElementById('detailTel').textContent = item.tel;
document.getElementById('detailImg').src = item.image;

// Render Affiliate Dynamic Buttons ( 자연스러운 예약 및 할인 링크 )
const affiliateGrid = document.getElementById('affiliateLinksGrid');
if (affiliateGrid) {
  AFFILIATE_LINKS.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'affiliate-btn';
    a.innerHTML = `<i class="fa-solid ${link.icon}"></i> ${link.name}`;
    affiliateGrid.appendChild(a);
  });
}

// Food Info
if (item.gourmetInfo) {
  document.getElementById('foodName').textContent = item.gourmetInfo.recommended;
  document.getElementById('foodMenu').textContent = item.gourmetInfo.specialty;
  document.getElementById('foodPrice').textContent = item.gourmetInfo.avgPrice;
}

// Stay Info
if (item.stayInfo) {
  document.getElementById('stayPriceRange').textContent = item.stayInfo.priceRange;
  document.getElementById('stayType').textContent = item.stayInfo.type;
}

// Pet Info
const petBox = document.getElementById('petBox');
if (item.petInfo) {
  petBox.innerHTML = `
    <strong>동반 여부:</strong> ${item.petInfo.allowed ? '가능' : '제한'}<br>
    <strong>입장 범위:</strong> ${item.petInfo.size}<br>
    <strong>준수 사항:</strong> ${item.petInfo.rules}
  `;
}

// Barrier Free Info
const bfBox = document.getElementById('bfBox');
if (item.barrierFree) {
  bfBox.innerHTML = `
    <strong>편의 지원:</strong> ${item.barrierFree.details}
  `;
}

// KakaoMap Link
const kakaoMapLink = document.getElementById('kakaoMapLink');
if (kakaoMapLink) {
  kakaoMapLink.href = `https://map.kakao.com/link/search/${encodeURIComponent(item.title)}`;
}

// Tags Grid
const detailTagsGrid = document.getElementById('detailTagsGrid');
if (detailTagsGrid) {
  item.tags.forEach(tag => {
    const span = document.createElement('a');
    span.href = `search.html?tag=${encodeURIComponent(tag)}`;
    span.className = 'card-tag-pill';
    span.textContent = `#${tag}`;
    detailTagsGrid.appendChild(span);
  });
}

// Bookmark Button
const bottomBookmarkBtn = document.getElementById('bottomBookmarkBtn');
if (bottomBookmarkBtn) {
  if (isBookmarked(item.id)) {
    bottomBookmarkBtn.classList.add('active');
  }
  bottomBookmarkBtn.addEventListener('click', () => {
    const added = toggleBookmark(item.id);
    bottomBookmarkBtn.classList.toggle('active', added);
  });
}

// Share Button
const shareHandler = () => {
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: item.desc,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('공유 링크가 클립보드에 복사되었습니다!');
  }
};

document.getElementById('bottomShareBtn')?.addEventListener('click', shareHandler);
document.getElementById('detailShareTopBtn')?.addEventListener('click', shareHandler);
