// 명함 상세 페이지 v2 — 3개 상태 (보기 / 편집 / 액션시트)
// B안 톤: 페이퍼 배경, 딥 네이비 악센트

const NAVY = '#1B2A4E';
const NAVY_SOFT = '#2C3E6B';
const INK = '#1C1C1E';
const PAPER = '#F5F3EE';

// ─── 공통 ─────────────────────────────────────
function DetailNavBar({ title, rightLabel = '편집' }) {
  return (
    <div style={{
      position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: NAVY }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span style={{ fontSize: 15, letterSpacing: -0.2, fontWeight: 500 }}>목록</span>
      </div>
      <div style={{ fontSize: 15, color: NAVY, fontWeight: 600, letterSpacing: -0.2 }}>
        {rightLabel}
      </div>
    </div>
  );
}

// ─── STATE A: 상세 보기 ───────────────────────
function DetailView() {
  const tags = ['CES 2026', '박사', 'AI'];
  const fields = [
    { label: '회사', value: '네이버', icon: 'building' },
    { label: '이메일', value: 'seoyeon@naver.com', icon: 'mail', action: true },
    { label: '전화', value: '010-4521-8876', icon: 'phone', action: true },
    { label: '주소', value: '경기도 성남시 분당구 정자일로 95', icon: 'map' },
  ];

  const Icon = ({ type }) => {
    const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: NAVY_SOFT, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (type === 'building') return <svg {...common}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" /><line x1="8" y1="6" x2="8" y2="6" /><line x1="12" y1="6" x2="12" y2="6" /><line x1="16" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="16" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" /></svg>;
    if (type === 'mail') return <svg {...common}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
    if (type === 'phone') return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
    if (type === 'map') return <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    return null;
  };

  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <DetailNavBar />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 90, paddingBottom: 140 }}>
        {/* 히어로 */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 44, margin: '0 auto 16px',
            background: 'oklch(0.94 0.03 150)', color: 'oklch(0.38 0.07 150)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, fontWeight: 500, letterSpacing: -0.5,
          }}>이</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: INK, letterSpacing: -0.5 }}>이서연 박사</div>
          <div style={{ fontSize: 15, color: 'rgba(60,60,67,0.65)', marginTop: 4, letterSpacing: -0.2 }}>
            AI 연구원 · 네이버
          </div>
          {/* 태그 배지 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 6, marginTop: 14,
          }}>
            {tags.map(t => (
              <div key={t} style={{
                padding: '4px 10px', borderRadius: 9999,
                background: 'rgba(27,42,78,0.08)', color: NAVY,
                fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div style={{
          display: 'flex', gap: 8, padding: '24px 16px 0',
        }}>
          {[
            { label: '전화', icon: 'phone' },
            { label: '이메일', icon: 'mail' },
            { label: '인사 메일', icon: 'send' },
          ].map(a => (
            <div key={a.label} style={{
              flex: 1, padding: '14px 0', borderRadius: 12,
              background: '#fff', border: '0.5px solid rgba(60,60,67,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                {a.icon === 'phone' && <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />}
                {a.icon === 'mail' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                {a.icon === 'send' && <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>}
              </svg>
              <span style={{ fontSize: 12, color: INK, fontWeight: 500, letterSpacing: -0.1 }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* 정보 카드 */}
        <div style={{
          margin: '20px 16px 0', background: '#fff', borderRadius: 14,
          border: '0.5px solid rgba(60,60,67,0.08)',
          overflow: 'hidden',
        }}>
          {fields.map((f, i) => (
            <div key={f.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderTop: i === 0 ? 'none' : '0.5px solid rgba(60,60,67,0.08)',
            }}>
              <Icon type={f.icon} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
                  letterSpacing: 0.4, textTransform: 'uppercase',
                }}>{f.label}</div>
                <div style={{
                  fontSize: 15, color: INK, marginTop: 2, letterSpacing: -0.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{f.value}</div>
              </div>
              {f.action && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.35)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* 메모 */}
        <div style={{
          margin: '12px 16px 0', padding: '14px 16px',
          background: '#fff', borderRadius: 14,
          border: '0.5px solid rgba(60,60,67,0.08)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6,
          }}>메모</div>
          <div style={{ fontSize: 14, color: INK, lineHeight: 1.55, letterSpacing: -0.15 }}>
            CES 2026 AI 패널에서 만남. LLM 에이전트 협업 아키텍처 관심 있음.
            2월 중순에 팔로업 미팅 제안하기로.
          </div>
        </div>

        {/* 메타 */}
        <div style={{
          padding: '20px 20px 0', textAlign: 'center',
          fontSize: 12, color: 'rgba(60,60,67,0.5)', letterSpacing: -0.1,
        }}>
          2026년 1월 9일 · CES 2026에서 저장
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── STATE B: 편집 모드 (태그 편집 초점) ────
function DetailEdit() {
  const addedTags = ['CES 2026', '박사', 'AI'];
  const recentTags = ['회사 동료', '디자이너', '개발자 컨퍼런스', '잠재 고객', '투자자'];

  const Field = ({ label, value }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        padding: '10px 14px', background: '#fff', borderRadius: 10,
        fontSize: 15, color: INK, letterSpacing: -0.2,
        border: '0.5px solid rgba(60,60,67,0.08)',
      }}>{value}</div>
    </div>
  );

  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />

      {/* 편집 모드 내브 */}
      <div style={{
        position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
      }}>
        <div style={{ fontSize: 15, color: 'rgba(60,60,67,0.7)', letterSpacing: -0.2 }}>취소</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: INK, letterSpacing: -0.2 }}>편집</div>
        <div style={{ fontSize: 15, color: NAVY, fontWeight: 600, letterSpacing: -0.2 }}>저장</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 90, paddingBottom: 80 }}>
        {/* 상단 아바타 */}
        <div style={{ padding: '12px 20px 0', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32, margin: '0 auto 8px',
            background: 'oklch(0.94 0.03 150)', color: 'oklch(0.38 0.07 150)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 500,
          }}>이</div>
          <div style={{ fontSize: 11, color: NAVY_SOFT, fontWeight: 500, letterSpacing: -0.1 }}>사진 변경</div>
        </div>

        {/* 필드 */}
        <div style={{ padding: '20px 16px 0' }}>
          <Field label="이름" value="이서연 박사" />
          <Field label="회사" value="네이버" />
          <Field label="직책" value="AI 연구원" />
          <Field label="이메일" value="seoyeon@naver.com" />
          <Field label="전화" value="010-4521-8876" />
        </div>

        {/* 기억 키워드 섹션 (강조) */}
        <div style={{
          margin: '20px 16px 0',
          padding: '18px 18px',
          background: 'rgba(27,42,78,0.04)',
          borderRadius: 14,
          border: `1px solid rgba(27,42,78,0.14)`,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: NAVY,
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4,
          }}>기억 키워드</div>
          <div style={{
            fontSize: 12, color: 'rgba(60,60,67,0.7)',
            letterSpacing: -0.1, marginBottom: 14, lineHeight: 1.45,
          }}>
            이 사람을 어떻게 기억하고 싶나요? 탭해서 제거 · 새로 입력 · 최근 목록에서 추가.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {addedTags.map(t => (
              <div key={t} style={{
                padding: '6px 8px 6px 12px', borderRadius: 9999,
                background: NAVY, color: '#fff',
                fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t}
                <div style={{
                  width: 16, height: 16, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </div>
              </div>
            ))}
            <div style={{
              padding: '6px 12px', borderRadius: 9999,
              background: '#fff',
              border: `1px dashed rgba(27,42,78,0.35)`,
              fontSize: 13, color: NAVY_SOFT, fontWeight: 500,
              letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>+ 새 키워드</div>
          </div>

          <div style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6,
          }}>최근 사용</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recentTags.map(t => (
              <div key={t} style={{
                padding: '5px 10px', borderRadius: 9999,
                background: 'rgba(255,255,255,0.9)',
                color: 'rgba(60,60,67,0.75)',
                fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                border: '0.5px solid rgba(60,60,67,0.12)',
              }}>+ {t}</div>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
          }}>메모</div>
          <div style={{
            padding: '12px 14px', background: '#fff', borderRadius: 10,
            fontSize: 14, color: INK, letterSpacing: -0.15, lineHeight: 1.55,
            border: '0.5px solid rgba(60,60,67,0.08)',
            minHeight: 90,
          }}>
            CES 2026 AI 패널에서 만남. LLM 에이전트 협업 아키텍처 관심 있음.
            <span style={{ background: 'rgba(27,42,78,0.08)' }}>|</span>
          </div>
        </div>

        {/* 삭제 버튼 */}
        <div style={{ padding: '28px 16px 0' }}>
          <div style={{
            padding: '12px 0', textAlign: 'center',
            background: '#fff', borderRadius: 12,
            fontSize: 15, fontWeight: 500, color: '#C0392B',
            letterSpacing: -0.2,
            border: '0.5px solid rgba(192,57,43,0.15)',
          }}>이 명함 삭제</div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── STATE C: 액션 시트 (공유/인사메일) ────
function DetailActionSheet() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      {/* 배경 블러 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }} />

      {/* 상세 내용은 흐릿하게 보이도록 (생략) */}
      <DetailNavBar />

      {/* 액션 시트 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
        padding: '12px 12px 40px',
      }}>
        {/* 메인 옵션 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 14, overflow: 'hidden',
          marginBottom: 8,
        }}>
          {[
            { label: '인사 이메일 보내기', sub: 'CES 2026에서 만난 분이에요', icon: 'send', primary: true },
            { label: '명함 이미지 공유', icon: 'share' },
            { label: '연락처에 추가', icon: 'user-plus' },
            { label: '복사하기', sub: '이름 · 이메일 · 전화', icon: 'copy' },
          ].map((a, i) => (
            <div key={a.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderTop: i === 0 ? 'none' : '0.5px solid rgba(60,60,67,0.08)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: a.primary ? NAVY : 'rgba(27,42,78,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.primary ? '#fff' : NAVY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  {a.icon === 'send' && <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>}
                  {a.icon === 'share' && <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>}
                  {a.icon === 'user-plus' && <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>}
                  {a.icon === 'copy' && <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 15, fontWeight: a.primary ? 600 : 500, color: INK,
                  letterSpacing: -0.2,
                }}>{a.label}</div>
                {a.sub && (
                  <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 1, letterSpacing: -0.1 }}>
                    {a.sub}
                  </div>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>

        {/* 취소 */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 14,
          padding: '14px 0',
          textAlign: 'center',
          fontSize: 16, fontWeight: 600, color: NAVY,
          letterSpacing: -0.2,
        }}>취소</div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { DetailView, DetailEdit, DetailActionSheet });
