// optvoyage - 15개 공공 API 통합 연동 & 캐싱 모듈
// 공공데이터포털 디코딩 인증키 적용
export const API_CONFIG = {
  serviceKey: "d69745b9fcc34ed246d774421d83826cb776107fc3d24079b38810a97e780ef4",
  tourApiBase: "https://apis.data.go.kr/B551011/KorService1",
  photoApiBase: "https://apis.data.go.kr/B551011/PhotoGalleryService1",
  goCampingBase: "https://apis.data.go.kr/B551011/GoCamping",
  durunubiBase: "https://apis.data.go.kr/B551011/DurunubiService",
};

// 24시간 브라우저 캐싱 유틸리티 (API 호출 한도 10,000건 보호 및 초고속 응답)
export async function fetchWithCache(url, cacheKey, ttlMs = 86400000) {
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < ttlMs) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn("Cache read error:", e);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (e) {
      // Quota exceeded
    }
    return data;
  } catch (err) {
    console.warn("API Fetch fallback:", err);
    return null;
  }
}

// 1. 한국관광공사 TourAPI 4.0 위치기반 주변 관광정보 호출
export async function getNearbySpots(mapX, mapY, radius = 10000) {
  if (!mapX || !mapY) return [];
  const url = `${API_CONFIG.tourApiBase}/locationBasedList1?serviceKey=${encodeURIComponent(API_CONFIG.serviceKey)}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=optvoyage&_type=json&mapX=${mapX}&mapY=${mapY}&radius=${radius}`;
  const data = await fetchWithCache(url, `nearby_${mapX}_${mapY}`);
  return data?.response?.body?.items?.item || [];
}

// 2. 관광사진 정보 조회
export async function searchTourPhotos(keyword) {
  if (!keyword) return [];
  const url = `${API_CONFIG.photoApiBase}/gallerySearchList1?serviceKey=${encodeURIComponent(API_CONFIG.serviceKey)}&numOfRows=5&pageNo=1&MobileOS=ETC&MobileApp=optvoyage&_type=json&keyword=${encodeURIComponent(keyword)}`;
  const data = await fetchWithCache(url, `photo_${keyword}`);
  return data?.response?.body?.items?.item || [];
}
