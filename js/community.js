import { CATEGORIES, COMMUNITY_PICKS } from './data.js';
import { initCommonUI, showToast } from './common.js';

initCommonUI();

const pickAvailableTags = document.getElementById('pickAvailableTags');
const selectedTags = new Set();

if (pickAvailableTags) {
  const allTags = [];
  Object.values(CATEGORIES).forEach(c => allTags.push(...c.tags));
  
  allTags.slice(0, 15).forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = `#${tag}`;
    chip.addEventListener('click', () => {
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        chip.classList.remove('selected');
      } else {
        selectedTags.add(tag);
        chip.classList.add('selected');
      }
    });
    pickAvailableTags.appendChild(chip);
  });
}

document.getElementById('createAndShareBtn')?.addEventListener('click', () => {
  const title = document.getElementById('myPickTitle').value.trim();
  if (!title) {
    showToast('픽 제목을 입력해주세요!');
    return;
  }
  navigator.clipboard.writeText(window.location.href);
  showToast('🎉 나만의 픽 저장 및 공유 링크가 복사되었습니다!');
});

const communityGrid = document.getElementById('communityGrid');
if (communityGrid) {
  COMMUNITY_PICKS.forEach(pick => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:20px; box-shadow:var(--shadow-sm);';
    card.innerHTML = `
      <div style="font-size:12px; font-weight:700; color:var(--primary-600); margin-bottom:4px;">by ${pick.author} · ❤️ ${pick.likes}</div>
      <h3 style="font-size:17px; font-weight:800; color:var(--text-main); margin-bottom:6px;">${pick.title}</h3>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${pick.desc}</p>
      <div style="display:flex; flex-wrap:wrap; gap:4px;">
        ${pick.tags.map(t => `<span class="card-tag-pill">#${t}</span>`).join('')}
      </div>
    `;
    communityGrid.appendChild(card);
  });
}
