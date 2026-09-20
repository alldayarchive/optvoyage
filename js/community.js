import { CATEGORIES, COMMUNITY_PICKS } from './data.js';
import { initCommonUI, showToast } from './common.js';

initCommonUI();

const selectedTags = new Set();
const userCustomPicks = JSON.parse(localStorage.getItem('optvoyage_my_custom_picks') || '[]');

const popularSampleTags = [
  "크리스마스/연말분위기", "신년해돋이/일출", "10만원이하가성비숙소", "로컬찐맛집밀집",
  "반려견동반가능", "시원한계곡", "푸른동해바다", "인피니티풀보유", "개별프라이빗온수풀",
  "완만한무장애나눔길", "입장료무료", "베이커리/빵지순례", "백년가게/노포맛집", "연인과함께(커플)"
];

const pickAvailableTags = document.getElementById('pickAvailableTags');
popularSampleTags.forEach(tag => {
  const chip = document.createElement('button');
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

document.getElementById('createAndShareBtn').addEventListener('click', () => {
  const title = document.getElementById('myPickTitle').value.trim();
  const desc = document.getElementById('myPickDesc').value.trim();

  if (!title) {
    alert('픽 제목을 입력해주세요!');
    return;
  }
  if (selectedTags.size === 0) {
    alert('최소 1개 이상의 태그를 선택해주세요!');
    return;
  }

  const newPick = {
    id: `user-${Date.now()}`,
    title,
    author: '나 (My Pick)',
    likes: 1,
    tags: Array.from(selectedTags),
    desc: desc || '내가 고른 감성 여행 코스'
  };

  userCustomPicks.unshift(newPick);
  localStorage.setItem('optvoyage_my_custom_picks', JSON.stringify(userCustomPicks));

  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ title, tags: newPick.tags }))));
  const shareUrl = `${window.location.origin}${window.location.pathname.replace('community.html', 'search.html')}?custom=${payload}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast('✨ 픽이 저장되고 공유 링크가 복사되었습니다!'))
      .catch(() => showToast('✨ 픽이 저장되었습니다!'));
  }

  renderAllCommunityPicks();
});

function renderAllCommunityPicks() {
  const grid = document.getElementById('communityGrid');
  grid.innerHTML = '';

  const allPicks = [...userCustomPicks, ...COMMUNITY_PICKS];

  allPicks.forEach(pick => {
    const card = document.createElement('div');
    card.style.background = '#ffffff';
    card.style.border = '1px solid #e2e8f0';
    card.style.borderRadius = 'var(--radius-lg)';
    card.style.padding = '20px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.cursor = 'pointer';
    card.style.transition = 'var(--transition)';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--primary-600);"><i class="fa-regular fa-user"></i> ${pick.author}</span>
        <span style="font-size: 12px; font-weight: 700; color: #ef4444;"><i class="fa-solid fa-heart"></i> ${pick.likes}</span>
      </div>
      <h3 style="font-size: 17px; font-weight: 800; margin-bottom: 6px; color: var(--text-main);">${pick.title}</h3>
      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; flex: 1;">${pick.desc}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px;">
        ${pick.tags.map(t => `<span class="card-tag-pill">#${t}</span>`).join('')}
      </div>
      <button class="btn-large-action" style="height: 38px; font-size: 13px;">
        <i class="fa-solid fa-magnifying-glass"></i> 이 픽으로 여행지 보기
      </button>
    `;

    card.addEventListener('click', () => {
      const firstTag = pick.tags[0];
      window.location.href = `search.html?tag=${encodeURIComponent(firstTag)}`;
    });

    grid.appendChild(card);
  });
}

renderAllCommunityPicks();
