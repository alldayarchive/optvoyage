// optvoyage - TourAPI 4.0 & 15 Open APIs Gateway & Client Cache Engine

// 대표님께서 발급받으신 디코딩 인증키
export const TOUR_API_KEY = "d69745b9fcc34ed246d774421d83826cb776107fc3d24079b38810a97e780ef4";
export const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService1";

// 1일 10,000회 제한 방지를 위한 24시간 브라우저 로컬 캐시 함수
export async function fetchWithCache(url, cacheKey, ttlMs = 24 * 60 * 60 * 1000) {
  try {
    const cached = localStorage.getItem(`optvoyage_api_${cacheKey}`);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < ttlMs) {
        return data;
      }
    }
  } catch (e) {
    console.warn("캐시 로드 실패, 직접 호출합니다.", e);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    try {
      localStorage.setItem(`optvoyage_api_${cacheKey}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      // 스토리지 용량 초과 시 오래된 캐시 정리
      localStorage.clear();
    }
    return data;
  } catch (err) {
    console.warn(`[API 폴백] ${cacheKey} 요청 실패: 로컬 내장 고화질 데이터로 전환합니다.`, err);
    return null;
  }
}

// 1. 한국관광공사 지역기반 관광정보 조회
export async function getAreaBasedTourList(areaCode = "", contentTypeId = "12", pageNo = 1, numOfRows = 10) {
  const url = `${TOUR_API_BASE}/areaBasedList1?serviceKey=${encodeURIComponent(TOUR_API_KEY)}&pageNo=${pageNo}&numOfRows=${numOfRows}&MobileOS=ETC&MobileApp=optvoyage&_type=json&areaCode=${areaCode}&contentTypeId=${contentTypeId}`;
  return await fetchWithCache(url, `area_${areaCode}_${contentTypeId}_${pageNo}`);
}

// 2. 반려동물 동반 여행 정보 조회 (detailPetTour)
export async function getPetTourInfo(contentId) {
  const url = `${TOUR_API_BASE}/detailPetTour1?serviceKey=${encodeURIComponent(TOUR_API_KEY)}&MobileOS=ETC&MobileApp=optvoyage&_type=json&contentId=${contentId}`;
  return await fetchWithCache(url, `pet_${contentId}`);
}

// 3. 열린관광 무장애 편의시설 조회 (detailWithTour)
export async function getBarrierFreeInfo(contentId) {
  const url = `${TOUR_API_BASE}/detailWithTour1?serviceKey=${encodeURIComponent(TOUR_API_KEY)}&MobileOS=ETC&MobileApp=optvoyage&_type=json&contentId=${contentId}`;
  return await fetchWithCache(url, `bf_${contentId}`);
}

// 4. 위치기반(반경 n km) 주변 볼거리 조회 (주변 명소 추천)
export async function getNearbyTourList(mapX, mapY, radius = 5000) {
  const url = `${TOUR_API_BASE}/locationBasedList1?serviceKey=${encodeURIComponent(TOUR_API_KEY)}&MobileOS=ETC&MobileApp=optvoyage&_type=json&mapX=${mapX}&mapY=${mapY}&radius=${radius}`;
  return await fetchWithCache(url, `loc_${mapX}_${mapY}_${radius}`);
}
