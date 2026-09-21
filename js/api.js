export const TOUR_API_KEY = "d69745b9fcc34ed246d774421d83826cb776107fc3d24079b38810a97e780ef4";
export const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService1";

// API 캐시 및 실시간 호출
export async function fetchWithCache(url, cacheKey) {
  try {
    const cached = localStorage.getItem(`opt_cache_${cacheKey}`);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
    }
  } catch (e) {}

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Fetch Error");
    const data = await res.json();
    localStorage.setItem(`opt_cache_${cacheKey}`, JSON.stringify({ timestamp: Date.now(), data }));
    return data;
  } catch (err) {
    return null;
  }
}

// 공공 API 실시간 키워드 검색
export async function searchTourAPI(keyword) {
  if (!keyword) return [];
  const url = `${TOUR_API_BASE}/searchKeyword1?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=optvoyage&_type=json&keyword=${encodeURIComponent(keyword)}&numOfRows=20`;
  const res = await fetchWithCache(url, `kw_${keyword}`);
  const items = res?.response?.body?.items?.item;
  if (!items) return [];
  return (Array.isArray(items) ? items : [items]).map(item => ({
    id: `api_${item.contentid}`,
    title: item.title,
    region: item.addr1?.split(' ')[0] || "전국",
    addr: item.addr1 || "",
    img: item.firstimage || item.firstimage2 || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    desc: `${item.addr1 || ''}에 위치한 명소입니다.`,
    tags: [keyword, "실시간추천"],
    rating: 4.8,
    mapx: item.mapx,
    mapy: item.mapy
  }));
}
