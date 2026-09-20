import { DESTINATIONS } from './data.js';
import { initCommonUI } from './common.js';

initCommonUI();

const diceBtn = document.getElementById('diceBtn');
const rerollBtn = document.getElementById('rerollBtn');
const diceStatus = document.getElementById('diceStatus');
const resultCard = document.getElementById('randomResultCard');

function roll() {
  diceBtn.classList.add('rolling');
  diceStatus.textContent = '운명의 여행지를 픽하는 중...';
  resultCard.style.display = 'none';

  setTimeout(() => {
    diceBtn.classList.remove('rolling');
    const randomIdx = Math.floor(Math.random() * DESTINATIONS.length);
    const item = DESTINATIONS[randomIdx];

    diceStatus.innerHTML = `🎉 당첨! 오늘의 운명 여행지는 <strong>${item.title}</strong> 입니다!`;
    document.getElementById('resultImg').src = item.image;
    document.getElementById('resultRegion').textContent = item.region;
    document.getElementById('resultTitle').textContent = item.title;
    document.getElementById('resultDesc').textContent = item.desc;
    document.getElementById('resultDetailLink').href = `detail.html?id=${item.id}`;

    resultCard.style.display = 'block';
  }, 700);
}

diceBtn.addEventListener('click', roll);
rerollBtn.addEventListener('click', roll);
