import { initCommonUI, showToast } from './common.js';
import { PICK_CATEGORIES, ALL_TAGS, INITIAL_DESTINATIONS } from './data.js';
import { searchTourAPI } from './api.js';

let selectedTags = new Set();
let activeCategory = "region";

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  parseUrlParams();
  renderCategoryTabs();
  renderTags();
  updateSearch();

  document.getElementById("clearAllTagsBtn")?.addEventListener("click", () => {
    selectedTags.clear();
    updateSearch();
  });

  document.getElementById("keywordSearchBtn")?.addEventListener("click", handleKeywordSearch);
});

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const tagParam = urlParams.get("tag");
  const catParam = urlParams.get("cat");
  if (tagParam) selectedTags.add(tagParam);
  if (catParam === "edu") activeCategory = "edu";
}

function renderCategoryTabs() {
  const bar = document.getElementById("categoryTabsBar");
  if (!bar) return;
  bar.innerHTML = PICK_CATEGORIES.map(cat => `
    <button class="tab-btn ${cat.id === activeCategory ? 'active' : ''}" data-id="${cat.id}">
      ${cat.name}
    </button>
  `).join('');

  bar.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.id;
      renderCategoryTabs();
      renderTags();
    });
  });
}

function renderTags() {
  const container = document.getElementById("currentCatTags");
  if (!container) return;
  const tags = ALL_TAGS[activeCategory] || [];
  container.innerHTML = tags.map(tag => `
    <span class="tag-chip ${selectedTags.has(tag) ? 'selected' : ''}" data-tag="${tag}">
      ${tag}
    </span>
  `).join('');

  container.querySelectorAll(".tag-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const t = chip.dataset.tag;
      if (selectedTags.has(t)) selectedTags.delete(t);
      else selectedTags.add(t);
      renderTags();
      updateSearch();
    });
  });
}

async function handleKeywordSearch() {
  const kw = document.getElementById("keywordInput")?.value.trim();
  if (!kw) return;
  showToast(`'${kw}' 키워드로 실시간 조회 중...`);
  const apiResults = await searchTourAPI(kw);
  renderResultGrid([...apiResults, ...INITIAL_DESTINATIONS.filter(d => d.title.includes(kw) || d.desc.includes(kw))]);
}

async function updateSearch() {
  renderActiveSummary();
  let results = [...INITIAL_DESTINATIONS];

  if (selectedTags.size > 0) {
    const activeArray = Array.from(selectedTags);
    results = results.filter(item => activeArray.every(tag => item.tags.includes(tag) || item.region === tag));

    // 로컬 데이터에 부합하지 않는 경우 TourAPI 실시간 호출
    if (results.length === 0) {
      showToast("공공데이터 API 실시간 호출 중...");
      const apiRes = await searchTourAPI(activeArray[0]);
      results = apiRes;
    }
  }

  renderResultGrid(results);
}

function renderActiveSummary() {
  const container = document.getElementById("activeTagsContainer");
  if (!container) return;
  container.innerHTML = Array.from(selectedTags).map(tag => `
    <span class="card-tag-pill">${tag}</span>
  `).join('');
}

function renderResultGrid(list) {
  const grid = document.getElementById("searchResultsGrid");
  const countEl = document.getElementById("resultTotalCount");
  if (countEl) countEl.innerText = list.length;
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">선택하신 픽 조건에 부합하는 여행지가 없습니다. 다른 태그를 조합해보세요!</div>`;
    return;
  }

  grid.innerHTML = list.map(item => `
    <div class="dest-card" onclick="location.href='detail.html?id=${item.id}'">
      <div class="card-thumb-wrap">
        <img class="card-thumb" src="${item.img}" alt="${item.title}">
        <span class="card-badge">${item.region}</span>
      </div>
      <div class="card-content">
        <div class="card-loc">${item.addr}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.desc}</p>
        <div class="card-tags">
          ${item.tags.map(t => `<span class="card-tag-pill">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}
