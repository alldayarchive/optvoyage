import { DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

// 검색창 제출
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

function createCardElement(item) {
  const card = document.createElement('div');
  card.className = 'dest-card';

  const bookmarked = isBookmarked(item.id);
  const priceText = item.stayInfo ? item.stayInfo.priceRange : '입장료 무료';

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img class="card-thumb" src="${item.image}" alt="${item.title}" loading="lazy">
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
        ${item.isEduPick ? '<span class="card-tag-pill edu"><i class="fa-solid fa-graduation-cap"></i> 학습탐방</span>' : ''}
        ${item.petInfo && item.petInfo.allowed ? '<span class="card-tag-pill" style="background:#fef9c3; color:#ca8a04;"><i class="fa-solid fa-paw"></i> 펫동반</span>' : ''}
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

// 1. 학습 코너 렌더링
const eduGrid = document.getElementById('eduPicksGrid');
if (eduGrid) {
  const eduItems = DESTINATIONS.filter(d => d.isEduPick);
  eduItems.forEach(item => eduGrid.appendChild(createCardElement(item)));
}

// 2. 에디터 추천 렌더링
const editorGrid = document.getElementById('editorPicksGrid');
if (editorGrid) {
  const editors = DESTINATIONS.filter(d => d.isEditorPick);
  editors.forEach(item => editorGrid.appendChild(createCardElement(item)));
}

// 3. 인기 여행지 렌더링
const popularGrid = document.getElementById('popularGrid');
if (popularGrid) {
  DESTINATIONS.slice(0, 6).forEach(item => popularGrid.appendChild(createCardElement(item)));
}
```

---

### ⑤ `js/search.js` (150+ 세부 픽 검색 & 일치율 매칭기)
```javascript
import { CATEGORIES, DESTINATIONS, AFFILIATE_LINKS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

const state = {
  selectedTags: new Set(),
  keyword: '',
  activeCategoryKey: 'region',
  viewMode: 'all',
};

const elements = {
  keywordInput: document.getElementById('keywordInput'),
  keywordSearchBtn: document.getElementById('keywordSearchBtn'),
  categoryTabsBar: document.getElementById('categoryTabsBar'),
  currentCatTitle: document.getElementById('currentCatTitle'),
  currentCatTags: document.getElementById('currentCatTags'),
  activeFilterSummary: document.getElementById('activeFilterSummary'),
  activeTagsContainer: document.getElementById('activeTagsContainer'),
  clearAllTagsBtn: document.getElementById('clearAllTagsBtn'),
  resetBtn: document.getElementById('resetBtn'),
  searchResultsGrid: document.getElementById('searchResultsGrid'),
  resultTotalCount: document.getElementById('resultTotalCount'),
  searchResultTitle: document.getElementById('searchResultTitle'),
};

function parseParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) {
    state.keyword = params.get('q');
    elements.keywordInput.value = state.keyword;
  }
  if (params.get('tag')) {
    state.selectedTags.add(params.get('tag'));
  }
  if (params.get('cat') === 'edu') {
    state.activeCategoryKey = 'edu_tour';
  }
  if (params.get('view')) {
    state.viewMode = params.get('view');
  }
}

function renderCategoryTabs() {
  elements.categoryTabsBar.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.className = `tag-chip ${key === state.activeCategoryKey ? 'selected' : ''}`;
    btn.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.title}`;
    btn.addEventListener('click', () => {
      state.activeCategoryKey = key;
      renderCategoryTabs();
      renderCurrentCategoryTags();
    });
    elements.categoryTabsBar.appendChild(btn);
  });
}

function renderCurrentCategoryTags() {
  const cat = CATEGORIES[state.activeCategoryKey];
  elements.currentCatTitle.innerHTML = `<i class="fa-solid ${cat.icon}"></i> <strong>${cat.title}</strong> 조건 선택 (${cat.tags.length}개):`;
  elements.currentCatTags.innerHTML = '';

  cat.tags.forEach(tag => {
    const chip = document.createElement('button');
    const isSelected = state.selectedTags.has(tag);
    chip.className = `tag-chip ${isSelected ? 'selected' : ''}`;
    chip.textContent = `#${tag}`;
    chip.addEventListener('click', () => {
      if (state.selectedTags.has(tag)) {
        state.selectedTags.delete(tag);
      } else {
        state.selectedTags.add(tag);
      }
      renderCurrentCategoryTags();
      filterAndRender();
    });
    elements.currentCatTags.appendChild(chip);
  });
}

function filterAndRender() {
  updateFilterSummary();

  let list = [...DESTINATIONS];

  if (state.viewMode === 'bookmarks') {
    elements.searchResultTitle.textContent = '내가 찜한 보관함';
    list = list.filter(d => isBookmarked(d.id));
  } else if (state.viewMode === 'editor') {
    elements.searchResultTitle.textContent = '에디터 추천 픽';
    list = list.filter(d => d.isEditorPick);
  } else {
    elements.searchResultTitle.textContent = '맞춤 세부 픽 결과';
  }

  if (state.keyword) {
    const kw = state.keyword.toLowerCase();
    list = list.filter(d => 
      d.title.toLowerCase().includes(kw) ||
      d.region.toLowerCase().includes(kw) ||
      d.address.toLowerCase().includes(kw) ||
      d.desc.toLowerCase().includes(kw) ||
      d.tags.some(t => t.toLowerCase().includes(kw))
    );
  }

  const selectedTagList = Array.from(state.selectedTags);
  if (selectedTagList.length > 0) {
    list = list.map(item => {
      const matchCount = selectedTagList.filter(t => item.tags.includes(t)).length;
      const matchRate = Math.round((matchCount / selectedTagList.length) * 100);
      return { ...item, matchCount, matchRate };
    });
    list = list.filter(item => item.matchCount > 0);
    list.sort((a, b) => b.matchRate - a.matchRate || b.rating - a.rating);
  }

  elements.resultTotalCount.textContent = list.length;
  renderGrid(list);
}

function updateFilterSummary() {
  if (state.selectedTags.size === 0 && !state.keyword) {
    elements.activeFilterSummary.style.display = 'none';
    return;
  }
  elements.activeFilterSummary.style.display = 'flex';
  elements.activeTagsContainer.innerHTML = '';

  if (state.keyword) {
    const kwChip = document.createElement('span');
    kwChip.className = 'tag-chip selected';
    kwChip.innerHTML = `검색: "${state.keyword}" <i class="fa-solid fa-xmark"></i>`;
    kwChip.addEventListener('click', () => {
      state.keyword = '';
      elements.keywordInput.value = '';
      filterAndRender();
    });
    elements.activeTagsContainer.appendChild(kwChip);
  }

  state.selectedTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip selected';
    chip.innerHTML = `#${tag} <i class="fa-solid fa-xmark"></i>`;
    chip.addEventListener('click', () => {
      state.selectedTags.delete(tag);
      renderCurrentCategoryTags();
      filterAndRender();
    });
    elements.activeTagsContainer.appendChild(chip);
  });
}

function renderGrid(items) {
  elements.searchResultsGrid.innerHTML = '';

  if (items.length === 0) {
    elements.searchResultsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-filter-circle-xmark" style="font-size: 40px; color: var(--text-light); margin-bottom: 12px;"></i>
        <h3 style="font-size: 18px; margin-bottom: 6px;">일치하는 여행지가 없습니다</h3>
        <p style="font-size: 14px; color: var(--text-muted);">선택하신 조건을 한두 개 해제하거나 다른 지역을 선택해보세요.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    const bookmarked = isBookmarked(item.id);
    const priceText = item.stayInfo ? item.stayInfo.priceRange : '입장료 무료';

    card.innerHTML = `
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="${item.image}" alt="${item.title}" loading="lazy">
        <span class="card-badge">${item.region.split(' ')[0]}</span>
        <button class="card-bookmark-btn ${bookmarked ? 'active' : ''}" data-id="${item.id}">
          <i class="${bookmarked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>
      <div class="card-content">
        <div class="card-loc"><i class="fa-solid fa-location-dot"></i> ${item.region}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.desc}</p>
        <div class="card-tags">
          ${item.matchRate ? `<span class="card-tag-pill" style="background:#dcfce7; color:#15803d; font-weight:800;">${item.matchRate}% 일치</span>` : ''}
          ${item.isEduPick ? '<span class="card-tag-pill edu"><i class="fa-solid fa-graduation-cap"></i> 학습</span>' : ''}
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

    const bBtn = card.querySelector('.card-bookmark-btn');
    bBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleBookmark(item.id);
      bBtn.classList.toggle('active', added);
      bBtn.querySelector('i').className = added ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      if (state.viewMode === 'bookmarks') filterAndRender();
    });

    card.addEventListener('click', () => {
      window.location.href = `detail.html?id=${item.id}`;
    });

    elements.searchResultsGrid.appendChild(card);
  });
}

elements.keywordSearchBtn.addEventListener('click', () => {
  state.keyword = elements.keywordInput.value.trim();
  filterAndRender();
});
elements.keywordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    state.keyword = elements.keywordInput.value.trim();
    filterAndRender();
  }
});

function resetAll() {
  state.selectedTags.clear();
  state.keyword = '';
  state.viewMode = 'all';
  elements.keywordInput.value = '';
  renderCurrentCategoryTags();
  filterAndRender();
}
elements.clearAllTagsBtn.addEventListener('click', resetAll);
elements.resetBtn.addEventListener('click', resetAll);

parseParams();
renderCategoryTabs();
renderCurrentCategoryTags();
filterAndRender();
