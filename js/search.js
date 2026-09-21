import { CATEGORIES, DESTINATIONS } from './data.js';
import { initCommonUI, toggleBookmark, isBookmarked } from './common.js';

initCommonUI();

const urlParams = new URLSearchParams(window.location.search);
let selectedTags = new Set();
let selectedCategory = Object.keys(CATEGORIES)[0];
let currentKeyword = urlParams.get('q') || '';
const viewMode = urlParams.get('view');
const initialTag = urlParams.get('tag');

if (initialTag) {
  selectedTags.add(initialTag);
}

const categoryTabsBar = document.getElementById('categoryTabsBar');
const currentCatTags = document.getElementById('currentCatTags');
const currentCatTitle = document.getElementById('currentCatTitle');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const activeFilterSummary = document.getElementById('activeFilterSummary');
const activeTagsContainer = document.getElementById('activeTagsContainer');
const keywordInput = document.getElementById('keywordInput');
const resultTotalCount = document.getElementById('resultTotalCount');
const searchResultTitle = document.getElementById('searchResultTitle');

if (keywordInput && currentKeyword) {
  keywordInput.value = currentKeyword;
}

function renderCategoryTabs() {
  if (!categoryTabsBar) return;
  categoryTabsBar.innerHTML = '';
  Object.keys(CATEGORIES).forEach(catKey => {
    const cat = CATEGORIES[catKey];
    const btn = document.createElement('button');
    btn.className = `tag-chip ${catKey === selectedCategory ? 'selected' : ''}`;
    btn.innerHTML = `<i class="fa-solid ${cat.icon}"></i> ${cat.title}`;
    btn.addEventListener('click', () => {
      selectedCategory = catKey;
      renderCategoryTabs();
      renderTagsForCategory();
    });
    categoryTabsBar.appendChild(btn);
  });
}

function renderTagsForCategory() {
  if (!currentCatTags) return;
  const cat = CATEGORIES[selectedCategory];
  currentCatTitle.textContent = `${cat.title} 세부 조건`;
  currentCatTags.innerHTML = '';
  cat.tags.forEach(tag => {
    const btn = document.createElement('button');
    const isSelected = selectedTags.has(tag);
    btn.className = `tag-chip ${isSelected ? 'selected' : ''}`;
    btn.textContent = `#${tag}`;
    btn.addEventListener('click', () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
      } else {
        selectedTags.add(tag);
      }
      renderTagsForCategory();
      updateFilterSummary();
      applyFilter();
    });
    currentCatTags.appendChild(btn);
  });
}

function updateFilterSummary() {
  if (!activeFilterSummary || !activeTagsContainer) return;
  if (selectedTags.size === 0 && !currentKeyword) {
    activeFilterSummary.style.display = 'none';
    return;
  }
  activeFilterSummary.style.display = 'flex';
  activeTagsContainer.innerHTML = '';

  if (currentKeyword) {
    const chip = document.createElement('span');
    chip.className = 'tag-chip selected';
    chip.innerHTML = `검색어: ${currentKeyword} <i class="fa-solid fa-xmark"></i>`;
    chip.addEventListener('click', () => {
      currentKeyword = '';
      if (keywordInput) keywordInput.value = '';
      updateFilterSummary();
      applyFilter();
    });
    activeTagsContainer.appendChild(chip);
  }

  selectedTags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip selected';
    chip.innerHTML = `#${tag} <i class="fa-solid fa-xmark"></i>`;
    chip.addEventListener('click', () => {
      selectedTags.delete(tag);
      renderTagsForCategory();
      updateFilterSummary();
      applyFilter();
    });
    activeTagsContainer.appendChild(chip);
  });
}

function applyFilter() {
  if (!searchResultsGrid) return;
  searchResultsGrid.innerHTML = '';

  let list = DESTINATIONS;

  if (viewMode === 'bookmarks') {
    const bookmarks = new Set(JSON.parse(localStorage.getItem('optvoyage_bookmarks') || '[]'));
    list = list.filter(item => bookmarks.has(item.id));
    if (searchResultTitle) searchResultTitle.textContent = '내가 찜한 보관함';
  } else if (viewMode === 'editor') {
    list = list.filter(item => item.isEditorPick);
    if (searchResultTitle) searchResultTitle.textContent = '에디터 추천 픽';
  }

  if (currentKeyword) {
    const kw = currentKeyword.toLowerCase();
    list = list.filter(item => 
      item.title.toLowerCase().includes(kw) ||
      item.region.toLowerCase().includes(kw) ||
      item.desc.toLowerCase().includes(kw)
    );
  }

  if (selectedTags.size > 0) {
    list = list.filter(item => {
      return Array.from(selectedTags).every(t => item.tags.includes(t));
    });
  }

  if (resultTotalCount) resultTotalCount.textContent = list.length;

  if (list.length === 0) {
    searchResultsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted);">
        <i class="fa-solid fa-compass" style="font-size: 48px; color: #cbd5e1; margin-bottom: 12px;"></i>
        <p style="font-size: 16px; font-weight: 700;">조건에 일치하는 여행지가 없습니다.</p>
        <p style="font-size: 13px;">다른 태그나 검색어를 선택해보세요!</p>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dest-card';
    const bookmarked = isBookmarked(item.id);
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
          ${item.tags.slice(0, 3).map(t => `<span class="card-tag-pill">#${t}</span>`).join('')}
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

    searchResultsGrid.appendChild(card);
  });
}

document.getElementById('keywordSearchBtn')?.addEventListener('click', () => {
  currentKeyword = keywordInput.value.trim();
  updateFilterSummary();
  applyFilter();
});

document.getElementById('clearAllTagsBtn')?.addEventListener('click', () => {
  selectedTags.clear();
  currentKeyword = '';
  if (keywordInput) keywordInput.value = '';
  renderTagsForCategory();
  updateFilterSummary();
  applyFilter();
});

document.getElementById('resetBtn')?.addEventListener('click', () => {
  selectedTags.clear();
  currentKeyword = '';
  if (keywordInput) keywordInput.value = '';
  updateFilterSummary();
  applyFilter();
});

renderCategoryTabs();
renderTagsForCategory();
updateFilterSummary();
applyFilter();
