export const PICK_CATEGORIES = [
  { id: "region", name: "📍 전국 17개 시도" },
  { id: "edu", name: "🦕 공룡·생가·역사유적" },
  { id: "nature", name: "🌲 계곡·산·바다" },
  { id: "theme", name: "💖 기념일·반려동물·힐링" }
];

export const ALL_TAGS = {
  region: ["서울", "경기", "인천", "강원", "충북", "충남", "대전", "경북", "경남", "대구", "울산", "부산", "전북", "전남", "광주", "제주", "세종"],
  edu: ["공룡발자국/화석지", "위인생가/유적지", "역사박물관", "전통사찰", "독립운동유적", "조선궁궐"],
  nature: ["시원한계곡", "국립공원/산", "해수욕장/바다", "자연휴양림", "동굴탐험"],
  theme: ["기념일/로맨틱", "반려견동반가능", "사진명소", "아이와함께", "차박/캠핑", "전통시장"]
};

export const INITIAL_DESTINATIONS = [
  {
    id: "dest_1",
    title: "고성 덕명리 공룡발자국 화석산지",
    region: "경남",
    addr: "경상남도 고성군 하이면 덕명5길 42-11",
    img: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800",
    desc: "백악기 공룡 발자국 화석이 선명하게 남아있는 해안 산책로이자 생태 학습 탐방지.",
    tags: ["경남", "공룡발자국/화석지", "아이와함께", "해수욕장/바다"],
    rating: 4.9,
    mapx: "128.145", mapy: "34.912"
  },
  {
    id: "dest_2",
    title: "안동 하회마을 & 위인 유적",
    region: "경북",
    addr: "경상북도 안동시 풍천면 하회종가길 40",
    img: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800",
    desc: "류성룡 선생의 생가와 조선 시대 유교 문화가 그대로 보존된 UNESCO 세계유산.",
    tags: ["경북", "위인생가/유적지", "역사박물관", "사진명소"],
    rating: 4.8,
    mapx: "128.518", mapy: "36.538"
  },
  {
    id: "dest_3",
    title: "포천 백운계곡 청정구역",
    region: "경기",
    addr: "경기도 포천시 이동면 도평리",
    img: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
    desc: "맑고 차가운 계곡물과 숲길이 아우러져 여름철 최적의 힐링 공간.",
    tags: ["경기", "시원한계곡", "자연휴양림", "차박/캠핑"],
    rating: 4.7,
    mapx: "127.348", mapy: "38.078"
  }
];
