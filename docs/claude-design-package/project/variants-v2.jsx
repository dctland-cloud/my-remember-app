// B안 — 다듬은 버전
// - 악센트: 딥 네이비 (#1B2A4E 계열)
// - 필터: 사용자 정의 "기억 키워드" (tags) — 장소, 관계, 프로젝트 등 자유
// - 그룹화: 선택한 키워드로 필터됨 (선택 시 그룹만 보임)
// - 빈 상태 포함

const NAVY = '#1B2A4E';       // 딥 네이비 (악센트)
const NAVY_SOFT = '#2C3E6B';  // 호버/서브
const INK = '#1C1C1E';
const PAPER = '#F5F3EE';      // 따뜻한 오프화이트
const PAPER_2 = '#EEE9E0';    // 필터 pill 배경

// 사용자가 자유롭게 붙이는 "기억 키워드" — 태그
// 예시: 만난 장소, 관계/역할, 프로젝트, 분야 등 섞임
const sampleCardsV2 = [
  { id: 1, name: '김민준', company: '토스', title: 'Product Designer', hue: 210, tags: ['CES 2026', '디자이너'], savedAt: '3일 전' },
  { id: 2, name: '이서연 박사', company: '네이버', title: 'AI 연구원', hue: 150, tags: ['CES 2026', '박사', 'AI'], savedAt: '3일 전' },
  { id: 3, name: '박도윤', company: '카카오', title: 'PM', hue: 30, tags: ['개발자 컨퍼런스', 'PM'], savedAt: '1주 전' },
  { id: 4, name: '최지우 박사', company: '삼성전자', title: '책임연구원', hue: 270, tags: ['CES 2026', '박사', '회사 동료'], savedAt: '1주 전' },
  { id: 5, name: '정하윤', company: '당근', title: 'Head of Design', hue: 15, tags: ['디자인 밋업', '디자이너'], savedAt: '2주 전' },
  { id: 6, name: '강시우', company: '쿠팡', title: '엔지니어링 매니저', hue: 200, tags: ['개발자 컨퍼런스'], savedAt: '3주 전' },
  { id: 7, name: '윤아린', company: '라인', title: 'iOS Developer', hue: 340, tags: ['디자인 밋업', '개발자'], savedAt: '1개월 전' },
  { id: 8, name: '조현우', company: '우아한형제들', title: 'Tech Lead', hue: 50, tags: ['CES 2026', '회사 동료'], savedAt: '1개월 전' },
];

// 모든 태그 수집 + 빈도 계산
function collectTags(cards) {
  const count = {};
  cards.forEach(c => c.tags.forEach(t => { count[t] = (count[t] || 0) + 1; }));
  return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([tag, n]) => ({ tag, n }));
}

// ── 공용 요소 재정의 (네이비) ─────────────────────────
function AvatarV2({ name, hue, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `oklch(0.94 0.03 ${hue})`,
      color: `oklch(0.38 0.07 ${hue})`,
      flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 500, letterSpacing: -0.3,
    }}>{name.charAt(0)}</div>
  );
}

function SearchBarV2() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      height: 36, padding: '0 10px',
      background: 'rgba(60,60,67,0.07)', borderRadius: 10,
      margin: '0 20px',
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.55)" strokeWidth={2.5} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style={{ color: 'rgba(60,60,67,0.55)', fontSize: 16, letterSpacing: -0.4 }}>
        이름, 회사, 직책 검색
      </span>
    </div>
  );
}

function TabBarV2({ active = 0 }) {
  const tabs = [
    { label: '홈', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 V12 H15 V22" /> },
    { label: '촬영', icon: <g><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></g> },
    { label: '내 명함', icon: <g><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M14 9h4M14 13h4 M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" /></g> },
    { label: '설정', icon: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></g> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(245,243,238,0.85)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: '0.5px solid rgba(60,60,67,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0 28px' }}>
        {tabs.map((t, i) => {
          const c = i === active ? NAVY : 'rgba(60,60,67,0.55)';
          return (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 60 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={i === active ? 2.1 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                {t.icon}
              </svg>
              <span style={{ fontSize: 10, fontWeight: i === active ? 600 : 500, color: c, letterSpacing: -0.1 }}>
                {t.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 헤더 (타이틀 + 메타) ────────────────────────────
function HeaderV2({ count, thisMonth }) {
  return (
    <div style={{ padding: '8px 20px 0' }}>
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)',
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>나만의 리멤버</div>
      <div style={{
        fontSize: 32, fontWeight: 700, color: INK,
        letterSpacing: -0.5, marginTop: 4,
      }}>만난 사람들</div>
      <div style={{
        fontSize: 15, color: 'rgba(60,60,67,0.6)',
        marginTop: 4, letterSpacing: -0.24,
      }}>
        총 <span style={{ color: INK, fontWeight: 500 }}>{count}장</span>
        {thisMonth != null && (
          <>
            <span style={{ margin: '0 6px' }}>·</span>
            이번 달 <span style={{ color: INK, fontWeight: 500 }}>{thisMonth}장</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── 필터 바 (사용자 키워드) ──────────────────────────
function FilterBarV2({ tags, active, onPick }) {
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '18px 20px 4px',
      scrollbarWidth: 'none',
    }}>
      <FilterPill label="전체" active={active === null} onClick={() => onPick(null)} />
      {tags.map(({ tag, n }) => (
        <FilterPill
          key={tag}
          label={tag}
          count={n}
          active={active === tag}
          onClick={() => onPick(tag)}
        />
      ))}
      {/* + 새 키워드 */}
      <div style={{
        flexShrink: 0, padding: '7px 12px',
        background: 'transparent',
        border: '1px dashed rgba(60,60,67,0.25)',
        borderRadius: 9999,
        fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>+ 키워드</div>
    </div>
  );
}

function FilterPill({ label, count, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      flexShrink: 0, padding: '7px 14px',
      background: active ? NAVY : 'rgba(255,255,255,0.9)',
      color: active ? '#fff' : 'rgba(60,60,67,0.85)',
      fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
      borderRadius: 9999,
      border: active ? 'none' : '0.5px solid rgba(60,60,67,0.12)',
      display: 'flex', alignItems: 'center', gap: 5,
      cursor: 'pointer',
    }}>
      {label}
      {count != null && (
        <span style={{
          fontSize: 11, opacity: active ? 0.85 : 0.5, fontVariantNumeric: 'tabular-nums',
        }}>{count}</span>
      )}
    </div>
  );
}

// ── 카드 아이템 ─────────────────────────────────────
function CardItem({ card, activeTag }) {
  // 활성 필터가 아닌 다른 태그만 보조로 표시
  const displayTags = activeTag
    ? card.tags.filter(t => t !== activeTag).slice(0, 1)
    : card.tags.slice(0, 2);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: '#FFF', borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)',
    }}>
      <AvatarV2 name={card.name} hue={card.hue} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 600, color: INK,
          letterSpacing: -0.32, lineHeight: '20px',
        }}>{card.name}</div>
        <div style={{
          fontSize: 14, color: 'rgba(60,60,67,0.7)',
          letterSpacing: -0.2, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{card.title} · {card.company}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {displayTags.map(t => (
          <div key={t} style={{
            fontSize: 11, color: NAVY,
            padding: '3px 8px', background: 'rgba(27,42,78,0.07)',
            borderRadius: 6, letterSpacing: -0.1, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

// ── 그룹 헤더 (필터 선택 시) ────────────────────────
function GroupHeader({ tag, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px 6px 8px',
    }}>
      <div style={{
        padding: '4px 10px', borderRadius: 9999,
        background: NAVY, color: '#fff',
        fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
      }}>{tag}</div>
      <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', letterSpacing: -0.2 }}>
        {count}명
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// V2-A: 기본 상태 (전체 — 필터 없음)
// ─────────────────────────────────────────────────────
function V2_All() {
  const tags = collectTags(sampleCardsV2);

  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <HeaderV2 count={sampleCardsV2.length} thisMonth={5} />
        <FilterBarV2 tags={tags} active={null} onPick={() => {}} />

        <div style={{ padding: '10px 16px 6px' }}>
          <SearchBarV2 />
        </div>

        <div style={{ padding: '14px 16px 120px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sampleCardsV2.map(c => <CardItem key={c.id} card={c} activeTag={null} />)}
        </div>
      </div>
      <TabBarV2 active={0} />
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────
// V2-B: 키워드 선택됨 (그룹화 뷰)
// ─────────────────────────────────────────────────────
function V2_Filtered() {
  const tags = collectTags(sampleCardsV2);
  const active = 'CES 2026';
  const filtered = sampleCardsV2.filter(c => c.tags.includes(active));

  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <HeaderV2 count={sampleCardsV2.length} thisMonth={5} />
        <FilterBarV2 tags={tags} active={active} onPick={() => {}} />

        <div style={{ padding: '16px 16px 8px' }}>
          <GroupHeader tag={active} count={filtered.length} />
        </div>

        <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => <CardItem key={c.id} card={c} activeTag={active} />)}
        </div>
      </div>
      <TabBarV2 active={0} />
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────
// V2-C: 빈 상태 (명함 0장)
// ─────────────────────────────────────────────────────
function V2_Empty() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <HeaderV2 count={0} thisMonth={null} />

        {/* 빈 상태 */}
        <div style={{
          padding: '80px 32px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          {/* 스택된 명함 일러스트 (미묘) */}
          <div style={{ position: 'relative', width: 140, height: 96, marginBottom: 24 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                left: i * 10, top: i * 6,
                width: 110, height: 70,
                borderRadius: 10,
                background: '#fff',
                border: `0.5px solid rgba(60,60,67,${0.08 + i * 0.04})`,
                boxShadow: `0 ${1 + i}px ${2 + i * 2}px rgba(0,0,0,0.04)`,
                transform: `rotate(${(i - 1) * 3}deg)`,
              }}>
                {i === 2 && (
                  <div style={{ padding: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 14,
                      background: 'oklch(0.94 0.03 210)',
                    }} />
                    <div style={{
                      marginTop: 6, height: 5, width: 50, borderRadius: 3,
                      background: 'rgba(60,60,67,0.15)',
                    }} />
                    <div style={{
                      marginTop: 4, height: 4, width: 70, borderRadius: 3,
                      background: 'rgba(60,60,67,0.08)',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            fontSize: 19, fontWeight: 600, color: INK,
            letterSpacing: -0.3, marginBottom: 6,
          }}>첫 명함을 추가해보세요</div>
          <div style={{
            fontSize: 14, color: 'rgba(60,60,67,0.65)',
            lineHeight: 1.5, letterSpacing: -0.2, maxWidth: 260,
          }}>
            명함을 촬영하면 AI가 자동으로 읽어 저장합니다.
            키워드를 붙여 "CES 2026", "박사", "회사 동료"처럼 기억해두세요.
          </div>

          {/* CTA */}
          <button style={{
            marginTop: 28, padding: '13px 24px',
            background: NAVY, color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600, letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(27,42,78,0.18)',
            cursor: 'pointer',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            명함 촬영하기
          </button>

          {/* 보조 링크 */}
          <div style={{
            marginTop: 14, fontSize: 13, color: NAVY_SOFT,
            fontWeight: 500, letterSpacing: -0.1,
          }}>갤러리에서 선택</div>
        </div>
      </div>
      <TabBarV2 active={0} />
    </IOSDevice>
  );
}

Object.assign(window, { V2_All, V2_Filtered, V2_Empty, NAVY, PAPER, INK });
