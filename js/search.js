import { CATEGORIES, DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

const state = {
  selectedTags: new Set(),
  keyword: '',
  activeCategoryKey: Object.keys(CATEGORIES)[0],
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
  if (params.get('cat') && CATEGORIES[params.get('cat')]) {
    state.activeCategoryKey = params.get('cat');
  }
  if (params.get('tag')) {
    state.selectedTags.add(params.get('tag'));
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
  elements.currentCatTitle.innerHTML = `<i class="fa-solid ${cat.icon}"></i> <strong>${cat.title}</strong> (${cat.tags.length}개):`;
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
    elements.searchResultTitle.textContent = '세부 픽 검색 결과';
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
        <p style="font-size: 14px; color: var(--text-muted);">조건을 조금 줄이거나 다른 카테고리를 선택해보세요.</p>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    const bookmarked = isBookmarked(item.id);
    const priceText = item.stayInfo ? item.stayInfo.priceRange : '입장료 무료';
    const isEdu = item.eduInfo && item.eduInfo.isEdu;

    card.innerHTML = `
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'">
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
          ${isEdu ? `<span class="card-tag-pill edu-pill"><i class="fa-solid fa-graduation-cap"></i> ${item.eduInfo.badge}</span>` : ''}
          ${item.matchRate ? `<span class="card-tag-pill" style="background:#dcfce7; color:#15803d; font-weight:800;">${item.matchRate}% 일치</span>` : ''}
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
