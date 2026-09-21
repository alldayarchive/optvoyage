import { initCommonUI } from './common.js';
import { INITIAL_DESTINATIONS } from './data.js';

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();

  const heroForm = document.getElementById("heroSearchForm");
  const heroInput = document.getElementById("heroSearchInput");

  if (heroForm && heroInput) {
    heroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = heroInput.value.trim();
      if (val) window.location.href = `search.html?keyword=${encodeURIComponent(val)}`;
    });
  }

  renderCards("eduPicksGrid", INITIAL_DESTINATIONS.filter(d => d.tags.includes("공룡발자국/화석지") || d.tags.includes("위인생가/유적지")));
  renderCards("popularGrid", INITIAL_DESTINATIONS);
});

function renderCards(targetId, list) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = list.map(item => `
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
