import { DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

// Search form submit
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

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img class="card-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'">
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
        ${item.petInfo && item.petInfo.allowed ? '<span class="card-tag-pill pet"><i class="fa-solid fa-paw"></i> 펫프렌들리</span>' : ''}
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

  // Bookmark toggle
  const bookmarkBtn = card.querySelector('.card-bookmark-btn');
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const added = toggleBookmark(item.id);
    bookmarkBtn.classList.toggle('active', added);
    const icon = bookmarkBtn.querySelector('i');
    icon.className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  });

  // Navigate to detail page
  card.addEventListener('click', () => {
    window.location.href = `detail.html?id=${item.id}`;
  });

  return card;
}

// Render Editor's Picks (4 items)
const editorGrid = document.getElementById('editorPicksGrid');
if (editorGrid) {
  const editors = DESTINATIONS.filter(d => d.isEditorPick).slice(0, 4);
  editors.forEach(item => editorGrid.appendChild(renderCard(item)));
}

// Render Popular (6 items)
const popularGrid = document.getElementById('popularGrid');
if (popularGrid) {
  const popular = DESTINATIONS.slice(0, 6);
  popular.forEach(item => popularGrid.appendChild(renderCard(item)));
}
