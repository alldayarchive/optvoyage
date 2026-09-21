import { initCommonUI } from './common.js';
import { INITIAL_DESTINATIONS } from './data.js';

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();

  const diceBtn = document.getElementById("diceBtn");
  const diceStatus = document.getElementById("diceStatus");
  const resultCard = document.getElementById("randomResultCard");
  const rerollBtn = document.getElementById("rerollBtn");

  function rollDice() {
    diceBtn.classList.add("rolling");
    diceStatus.innerText = "운명의 여행지를 고르는 중...";
    resultCard.style.display = "none";

    setTimeout(() => {
      diceBtn.classList.remove("rolling");
      const randomItem = INITIAL_DESTINATIONS[Math.floor(Math.random() * INITIAL_DESTINATIONS.length)];

      document.getElementById("resultImg").src = randomItem.img;
      document.getElementById("resultTitle").innerText = randomItem.title;
      document.getElementById("resultRegion").innerText = randomItem.region;
      document.getElementById("resultDesc").innerText = randomItem.desc;
      document.getElementById("resultDetailLink").href = `detail.html?id=${randomItem.id}`;

      diceStatus.innerText = "당신만을 위한 추천 명소!";
      resultCard.style.display = "block";
      rerollBtn.style.display = "block";
    }, 800);
  }

  diceBtn?.addEventListener("click", rollDice);
  rerollBtn?.addEventListener("click", rollDice);
});
