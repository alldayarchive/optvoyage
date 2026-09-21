import { initCommonUI, toggleBookmark, getBookmarks } from './common.js';
import { INITIAL_DESTINATIONS } from './data.js';

document.addEventListener("DOMContentLoaded", () => {
  initCommonUI();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const item = INITIAL_DESTINATIONS.find(d => d.id === id) || INITIAL_DESTINATIONS[0];

  document.getElementById("detailTitle").innerText = item.title;
  document.getElementById("detailImg").src = item.img;
  document.getElementById("detailDesc").innerText = item.desc;
  document.getElementById("detailAddress").innerText = item.addr;
  document.getElementById("detailRegion").innerText = item.region;
  document.getElementById("detailRating").innerText = item.rating;

  const kakaoBtn = document.getElementById("kakaoMapLink");
  if (kakaoBtn) {
    kakaoBtn.href = `https://map.kakao.com/link/search/${encodeURIComponent(item.title)}`;
  }

  const tagsGrid = document.getElementById("detailTagsGrid");
  if (tagsGrid) {
    tagsGrid.innerHTML = item.tags.map(t => `<span class="card-tag-pill">${t}</span>`).join('');
  }

  const bmBtn = document.getElementById("bottomBookmarkBtn");
  if (bmBtn) {
    if (getBookmarks().includes(item.id)) bmBtn.classList.add("active");
    bmBtn.addEventListener("click", () => {
      const isBookmarked = toggleBookmark(item.id);
      bmBtn.classList.toggle("active", isBookmarked);
    });
  }
});
