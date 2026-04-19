// 3가지 홈 화면 변형 — Apple 스타일 톤
// Variation A: iOS 연락처 스타일 (초성 섹션, 초절제)
// Variation B: Apple Notes / Journal 스타일 (오프화이트, 떠있는 카드)
// Variation C: Apple Wallet 스타일 (스택 카드, 다크 옵션)

// ─── 샘플 데이터 ────────────────────────────────────────────
const sampleCards = [
  { id: 1, name: '김민준', company: '토스', title: 'Product Designer', metAt: 'CES 2026', hue: 210, initial: '김' },
  { id: 2, name: '이서연', company: '네이버', title: '개발자', metAt: 'CES 2026', hue: 150, initial: '이' },
  { id: 3, name: '박도윤', company: '카카오', title: 'PM', metAt: '개발자 컨퍼런스', hue: 30, initial: '박' },
  { id: 4, name: '최지우', company: '삼성전자', title: '책임연구원', metAt: 'CES 2026', hue: 270, initial: '최' },
  { id: 5, name: '정하윤', company: '당근', title: 'Head of Design', metAt: '디자인 밋업', hue: 15, initial: '정' },
  { id: 6, name: '강시우', company: '쿠팡', title: '엔지니어링 매니저', metAt: '개발자 컨퍼런스', hue: 200, initial: '강' },
  { id: 7, name: '윤아린', company: '라인', title: 'iOS Developer', metAt: '디자인 밋업', hue: 340, initial: '윤' },
  { id: 8, name: '조현우', company: '우아한형제들', title: 'Tech Lead', metAt: 'CES 2026', hue: 50, initial: '조' },
];

// 그룹화 (초성)
function groupByInitial(cards) {
  const groups = {};
  cards.forEach(c => {
    const i = c.initial;
    if (!groups[i]) groups[i] = [];
    groups[i].push(c);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'ko'));
}

// ─── 공용 아바타 ─────────────────────────────────────────────
function Avatar({ name, hue, size = 40, dark = false, style = 'tinted' }) {
  const bg = style === 'tinted'
    ? `oklch(0.92 0.04 ${hue})`
    : dark ? '#2C2C2E' : '#E5E5EA';
  const fg = style === 'tinted'
    ? `oklch(0.42 0.08 ${hue})`
    : dark ? '#EBEBF0' : '#1C1C1E';
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: bg, color: fg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 500,
      letterSpacing: -0.3,
    }}>{name.charAt(0)}</div>
  );
}

// ─── 검색바 (iOS 스타일) ────────────────────────────────────
function SearchBar({ dark = false, placeholder = '검색' }) {
  const bg = dark ? 'rgba(118,118,128,0.24)' : 'rgba(118,118,128,0.12)';
  const fg = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      height: 36, padding: '0 8px',
      background: bg, borderRadius: 10,
      margin: '0 16px',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth={2.5} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style={{ color: fg, fontSize: 17, letterSpacing: -0.43 }}>{placeholder}</span>
    </div>
  );
}

// ─── 하단 탭바 (공용) ──────────────────────────────────────
function TabBar({ dark = false, accent = '#007AFF', active = 0 }) {
  const bg = dark ? 'rgba(22,22,24,0.82)' : 'rgba(249,249,249,0.82)';
  const inactive = dark ? 'rgba(235,235,245,0.5)' : 'rgba(60,60,67,0.55)';
  const border = dark ? 'rgba(84,84,88,0.4)' : 'rgba(60,60,67,0.15)';

  const tabs = [
    { label: '홈', icon: (c) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active === 0 ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )},
    { label: '촬영', icon: (c) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    )},
    { label: '내 명함', icon: (c) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="8" cy="11" r="2" />
        <path d="M14 9h4M14 13h4" />
        <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
      </svg>
    )},
    { label: '설정', icon: (c) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: bg,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: `0.5px solid ${border}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingTop: 8, paddingBottom: 28,
      }}>
        {tabs.map((t, i) => {
          const c = i === active ? accent : inactive;
          return (
            <div key={t.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              minWidth: 60,
            }}>
              {t.icon(c)}
              <span style={{
                fontSize: 10, fontWeight: i === active ? 600 : 500,
                color: c, letterSpacing: -0.1,
              }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// VARIATION A — iOS 연락처 스타일
// 순백 배경, 초성 인덱스, 얇은 디바이더, 섹션별 그룹화
// ─────────────────────────────────────────────────────────
function VariantA() {
  const groups = groupByInitial(sampleCards);
  const accent = '#007AFF';
  const ACCENT = accent;

  return (
    <IOSDevice width={390} height={844} dark={false}>
      {/* 커스텀 네비바 */}
      <div style={{ paddingTop: 52, paddingBottom: 6 }}>
        {/* 상단 우측 + 버튼 */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '6px 16px 0',
        }}>
          <div style={{ color: ACCENT, fontSize: 17, fontWeight: 400, letterSpacing: -0.43 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
        {/* Large Title */}
        <div style={{
          padding: '6px 16px 8px',
          fontSize: 34, fontWeight: 700, letterSpacing: 0.37,
          color: '#000',
        }}>명함</div>
        {/* 검색바 */}
        <SearchBar />
      </div>

      {/* 섹션별 리스트 */}
      <div style={{ paddingBottom: 120 }}>
        {groups.map(([initial, cards], gi) => (
          <div key={initial} style={{ marginTop: gi === 0 ? 8 : 14 }}>
            <div style={{
              padding: '0 16px 4px',
              fontSize: 13, fontWeight: 600, color: 'rgba(60,60,67,0.6)',
              letterSpacing: -0.08,
            }}>{initial}</div>
            <div style={{ background: '#fff' }}>
              {cards.map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 16px',
                  borderTop: i === 0 ? '0.5px solid rgba(60,60,67,0.18)' : 'none',
                  borderBottom: '0.5px solid rgba(60,60,67,0.18)',
                }}>
                  <Avatar name={c.name} hue={c.hue} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 17, fontWeight: 400, color: '#000',
                      letterSpacing: -0.43, lineHeight: '22px',
                    }}>
                      <span style={{ fontWeight: 600 }}>{c.name.charAt(0)}</span>
                      {c.name.slice(1)}
                    </div>
                    <div style={{
                      fontSize: 14, color: 'rgba(60,60,67,0.6)',
                      letterSpacing: -0.23, marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {c.company} · {c.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 우측 초성 인덱스 */}
      <div style={{
        position: 'absolute', right: 4, top: '40%', transform: 'translateY(-30%)',
        display: 'flex', flexDirection: 'column', gap: 1, zIndex: 30,
      }}>
        {['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'].map(c => (
          <div key={c} style={{
            fontSize: 10, fontWeight: 600, color: ACCENT,
            width: 14, textAlign: 'center', lineHeight: '14px',
          }}>{c}</div>
        ))}
      </div>

      <TabBar accent={ACCENT} active={0} />
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────
// VARIATION B — Apple Notes / Journal 스타일
// 따뜻한 오프화이트, 떠있는 카드, 카테고리 pill
// ─────────────────────────────────────────────────────────
function VariantB() {
  const accent = '#1E88E5'; // 약간 더 차분한 블루
  const bg = '#F5F3EE'; // 따뜻한 오프화이트

  const locations = ['전체', 'CES 2026', '개발자 컨퍼런스', '디자인 밋업'];

  return (
    <IOSDevice width={390} height={844} dark={false}>
      {/* 배경 오버라이드 */}
      <div style={{
        position: 'absolute', inset: 0, background: bg, zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        {/* 상단 작은 라벨 + 큰 타이틀 */}
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{
            fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)',
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>나만의 리멤버</div>
          <div style={{
            fontSize: 32, fontWeight: 700, color: '#1C1C1E',
            letterSpacing: -0.5, marginTop: 4,
          }}>만난 사람들</div>
          <div style={{
            fontSize: 15, color: 'rgba(60,60,67,0.6)',
            marginTop: 4, letterSpacing: -0.24,
          }}>
            총 <span style={{ color: '#1C1C1E', fontWeight: 500 }}>{sampleCards.length}장</span>
            <span style={{ margin: '0 6px' }}>·</span>
            이번 달 <span style={{ color: '#1C1C1E', fontWeight: 500 }}>5장</span>
          </div>
        </div>

        {/* 카테고리 필터 pill */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '20px 20px 4px',
          scrollbarWidth: 'none',
        }}>
          {locations.map((loc, i) => {
            const active = i === 0;
            return (
              <div key={loc} style={{
                flexShrink: 0, padding: '7px 14px',
                background: active ? '#1C1C1E' : 'rgba(255,255,255,0.9)',
                color: active ? '#fff' : 'rgba(60,60,67,0.8)',
                fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
                borderRadius: 9999,
                border: active ? 'none' : '0.5px solid rgba(60,60,67,0.12)',
              }}>{loc}</div>
            );
          })}
        </div>

        {/* 카드 목록 */}
        <div style={{
          padding: '14px 16px 120px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {sampleCards.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: '#FFF',
              borderRadius: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)',
            }}>
              <Avatar name={c.name} hue={c.hue} size={44} style="tinted" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: '#1C1C1E',
                  letterSpacing: -0.32, lineHeight: '20px',
                }}>{c.name}</div>
                <div style={{
                  fontSize: 14, color: 'rgba(60,60,67,0.7)',
                  letterSpacing: -0.2, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{c.title} · {c.company}</div>
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(60,60,67,0.55)',
                padding: '3px 8px', background: 'rgba(60,60,67,0.06)',
                borderRadius: 6, letterSpacing: -0.1,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{c.metAt}</div>
            </div>
          ))}
        </div>
      </div>

      <TabBar accent={accent} active={0} />
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────
// VARIATION C — Apple Wallet 스타일 (다크)
// 명함을 Wallet 패스처럼 스택/카드 형태로, 리스트 밀도는 유지
// ─────────────────────────────────────────────────────────
function VariantC() {
  const accent = '#0A84FF';
  const bg = '#000';

  return (
    <IOSDevice width={390} height={844} dark={true}>
      <div style={{
        position: 'absolute', inset: 0, background: bg, zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 56 }}>
        {/* 상단 네비 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 20px',
        }}>
          <div style={{
            fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 0.3,
          }}>명함</div>
          <div style={{
            width: 30, height: 30, borderRadius: 15,
            background: 'rgba(118,118,128,0.24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>

        {/* 상단 검색 */}
        <div style={{ padding: '14px 0 6px' }}>
          <SearchBar dark={true} />
        </div>

        {/* 스택 카드 (최근 3장) */}
        <div style={{ padding: '18px 20px 10px', position: 'relative', height: 200 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'rgba(235,235,245,0.55)',
            letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 10,
          }}>최근</div>
          {sampleCards.slice(0, 3).map((c, i) => {
            const offset = i * 22;
            return (
              <div key={c.id} style={{
                position: 'absolute', left: 20, right: 20,
                top: 38 + offset, height: 120,
                borderRadius: 14,
                background: `linear-gradient(135deg, oklch(0.55 0.15 ${c.hue}), oklch(0.38 0.18 ${c.hue}))`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                zIndex: 10 - i,
                padding: '14px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                color: '#fff',
                transform: i === 0 ? 'scale(1)' : `scale(${1 - i * 0.01})`,
              }}>
                {i === 0 && (
                  <>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                          {c.company}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 3, letterSpacing: -0.3 }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{c.title}</div>
                      </div>
                      <div style={{
                        fontSize: 10, padding: '3px 8px',
                        background: 'rgba(255,255,255,0.18)', borderRadius: 6,
                        letterSpacing: 0.2,
                      }}>{c.metAt}</div>
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: 0.2 }}>
                      14일 전 저장
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 모든 명함 리스트 */}
        <div style={{ padding: '130px 0 120px' }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'rgba(235,235,245,0.55)',
            letterSpacing: 0.3, textTransform: 'uppercase',
            padding: '0 20px 10px',
          }}>전체 {sampleCards.length}장</div>

          <div style={{ margin: '0 16px', background: '#1C1C1E', borderRadius: 14, overflow: 'hidden' }}>
            {sampleCards.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                borderBottom: i < sampleCards.length - 1 ? '0.5px solid rgba(84,84,88,0.4)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: `linear-gradient(135deg, oklch(0.55 0.15 ${c.hue}), oklch(0.38 0.18 ${c.hue}))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 600, color: '#fff',
                  flexShrink: 0,
                }}>{c.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 500, color: '#fff',
                    letterSpacing: -0.3, lineHeight: '19px',
                  }}>{c.name}</div>
                  <div style={{
                    fontSize: 13, color: 'rgba(235,235,245,0.55)',
                    letterSpacing: -0.2, marginTop: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{c.company} · {c.title}</div>
                </div>
                <svg width="7" height="12" viewBox="0 0 8 14" style={{ flexShrink: 0 }}>
                  <path d="M1 1l6 6-6 6" stroke="rgba(235,235,245,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar dark={true} accent={accent} active={0} />
    </IOSDevice>
  );
}

Object.assign(window, { VariantA, VariantB, VariantC, sampleCards });
