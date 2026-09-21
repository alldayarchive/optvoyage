// optvoyage - Common Utilities & Navigation

export function initCommonUI() {
  const menuBtn = document.getElementById('menuBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');

  if (menuBtn && dropdownMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) {
        dropdownMenu.classList.remove('show');
      }
    });
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }
}

export function getBookmarks() {
  try {
    return new Set(JSON.parse(localStorage.getItem('optvoyage_bookmarks') || '[]'));
  } catch {
    return new Set();
  }
}

export function toggleBookmark(id) {
  const bookmarks = getBookmarks();
  let added = false;
  if (bookmarks.has(id)) {
    bookmarks.delete(id);
    showToast('찜 목록에서 삭제되었습니다.');
  } else {
    bookmarks.add(id);
    added = true;
    showToast('💖 내 보관함에 찜 완료되었습니다!');
  }
  localStorage.setItem('optvoyage_bookmarks', JSON.stringify(Array.from(bookmarks)));
  return added;
}

export function isBookmarked(id) {
  return getBookmarks().has(id);
}

export function showToast(message) {
  let toast = document.getElementById('toastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMsg';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
