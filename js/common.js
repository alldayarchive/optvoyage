export function initCommonUI() {
  const menuBtn = document.getElementById("menuBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const backBtn = document.getElementById("backBtn");

  if (menuBtn && dropdownMenu) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });
    document.addEventListener("click", () => dropdownMenu.classList.remove("show"));
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => history.back());
  }
}

export function showToast(msg) {
  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

export function getBookmarks() {
  return JSON.parse(localStorage.getItem("opt_bookmarks") || "[]");
}

export function toggleBookmark(id) {
  let list = getBookmarks();
  if (list.includes(id)) {
    list = list.filter(item => item !== id);
    showToast("보관함에서 삭제되었습니다.");
  } else {
    list.push(id);
    showToast("보관함에 저장되었습니다!");
  }
  localStorage.setItem("opt_bookmarks", JSON.stringify(list));
  return list.includes(id);
}
