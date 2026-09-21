import { DESTINATIONS } from './data.js';
import { initCommonUI } from './common.js';

initCommonUI();

const diceBtn = document.getElementById('diceBtn');
const diceStatus = document.getElementById('diceStatus');
const resultCard = document.getElementById('randomResultCard');
const rerollBtn = document.getElementById('rerollBtn');

function rollDice() {
  if (!diceBtn) return;
  diceBtn.classList.add('rolling');
  diceStatus.textContent = '운명의 여행지를 뽑는 중...';
  if (resultCard) resultCard.style.display = 'none';

  setTimeout(() => {
    diceBtn.classList.remove('rolling');
    const randomIndex = Math.floor(Math.random() * DESTINATIONS.length);
    const item = DESTINATIONS[randomIndex];

    document.getElementById('resultImg').src = item.image;
    document.getElementById('resultRegion').textContent = item.region;
    document.getElementById('resultTitle').textContent = item.title;
    document.getElementById('resultDesc').textContent = item.desc;
    document.getElementById('resultDetailLink').href = `detail.html?id=${item.id}`;

    if (resultCard) resultCard.style.display = 'block';
    diceStatus.textContent = '🎉 당신을 위한 운명의 여행지 확정!';
  }, 1000);
}

diceBtn?.addEventListener('click', rollDice);
rerollBtn?.addEventListener('click', rollDice);
