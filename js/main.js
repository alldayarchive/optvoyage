import { DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

const searchForm = document.getElementById('heroSearchForm');
const searchInput = document.getElementById('heroSearchInput');
if (searchForm && searchInput) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = 'search.html';
    }
  });
}

function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'dest-card';

  const bookmarked = isBookmarked(item.id);
  const priceText = item.stayInfo ? item.stayInfo.priceRange : '입장료 무료';
  const isEdu = item.eduInfo && item.eduInfo.isEdu;

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img class="card-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'">
      <span class="card-badge">${item.region.split(' ')[0]}</span>
      <button class="card-bookmark-btn ${bookmarked ? 'active' : ''}" data-id="${item.id}" title="찜하기">
        <i class="${bookmarked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
    </div>
    <div class="card-content">
      <div class="card-loc"><i class="fa-solid fa-location-dot"></i> ${item.region}</div>
      <h3 class="card-title">${item.title}</h3>
      <p class="card-desc">${item.desc}</p>
      <div class="card-tags">
        ${isEdu ? `<span class="card-tag-pill edu-pill"><i class="fa-solid fa-graduation-cap"></i> ${item.eduInfo.badge}</span>` : ''}
        ${item.petInfo && item.petInfo.allowed ? '<span class="card-tag-pill pet"><i class="fa-solid fa-paw"></i> 펫동반</span>' : ''}
        ${item.tags.slice(0, 2).map(t => `<span class="card-tag-pill">#${t}</span>`).join('')}
      </div>
      <div class="card-footer">
        <div class="card-score">
          <i class="fa-solid fa-star"></i>
          <span>${item.rating}</span>
        </div>
        <div class="card-price-est">${priceText}</div>
      </div>
    </div>
  `;

  const bookmarkBtn = card.querySelector('.card-bookmark-btn');
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const added = toggleBookmark(item.id);
    bookmarkBtn.classList.toggle('active', added);
    bookmarkBtn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  });

  card.addEventListener('click', () => {
    window.location.href = `detail.html?id=${item.id}`;
  });

  return card;
}

// 1. 학습 코너 그리드 렌더링
const eduGrid = document.getElementById('eduPicksGrid');
if (eduGrid) {
  const eduItems = DESTINATIONS.filter(d => d.eduInfo && d.eduInfo.isEdu);
  eduItems.forEach(item => eduGrid.appendChild(renderCard(item)));
}

// 2. 에디터 추천
const editorGrid = document.getElementById('editorPicksGrid');
if (editorGrid) {
  const editors = DESTINATIONS.filter(d => d.isEditorPick).slice(0, 4);
  editors.forEach(item => editorGrid.appendChild(renderCard(item)));
}

// 3. 인기 여행지
const popularGrid = document.getElementById('popularGrid');
if (popularGrid) {
  const popular = DESTINATIONS.slice(0, 6);
  popular.forEach(item => popularGrid.appendChild(renderCard(item)));
}
