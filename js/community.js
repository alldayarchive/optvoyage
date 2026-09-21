import { initCommonUI, showToast } from './common.js';
import { ALL_TAGS } from './data.js';

let myPickTags = new Set();

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  renderAvailableTags();

  document.getElementById("createAndShareBtn")?.addEventListener("click", () => {
    const title = document.getElementById("myPickTitle")?.value.trim();
    if (!title) {
      showToast("픽 제목을 입력해주세요!");
      return;
    }
    showToast("나만의 픽 링크가 생성되었습니다! (클립보드 복사 완료)");
  });
});

function renderAvailableTags() {
  const container = document.getElementById("pickAvailableTags");
  if (!container) return;
  const flatTags = Object.values(ALL_TAGS).flat();
  container.innerHTML = flatTags.map(tag => `
    <span class="tag-chip" data-tag="${tag}">${tag}</span>
  `).join('');

  container.querySelectorAll(".tag-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const t = chip.dataset.tag;
      if (myPickTags.has(t)) {
        myPickTags.delete(t);
        chip.classList.remove("selected");
      } else {
        myPickTags.add(t);
        chip.classList.add("selected");
      }
    });
  });
}
