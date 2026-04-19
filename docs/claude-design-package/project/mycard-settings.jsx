// 내 디지털 명함 + 설정 v2 — 4개 상태
// B안 톤 유지: 페이퍼 배경, 딥 네이비 악센트

const NAVY = '#1B2A4E';
const NAVY_SOFT = '#2C3E6B';
const INK = '#1C1C1E';
const PAPER = '#F5F3EE';
const PAPER_2 = '#EEE9E0';

// ─── A: 내 디지털 명함 (mycard) ────────────
function MyCard() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 60, paddingBottom: 100 }}>
        {/* 헤더 */}
        <div style={{ padding: '0 20px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            내 디지털 명함
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: INK, letterSpacing: -0.5, marginTop: 4 }}>
            이렇게 보여요
          </div>
          <div style={{ fontSize: 14, color: 'rgba(60,60,67,0.65)', marginTop: 4, letterSpacing: -0.2, lineHeight: 1.5 }}>
            링크로 공유하면 상대방에게 이 모습으로 보입니다
          </div>
        </div>

        {/* 명함 카드 */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{
            background: NAVY,
            borderRadius: 20, padding: '28px 24px',
            color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(27,42,78,0.3)',
          }}>
            {/* 배경 장식 */}
            <div style={{
              position: 'absolute', right: -40, top: -40,
              width: 180, height: 180, borderRadius: 90,
              background: 'rgba(255,255,255,0.04)',
            }} />
            <div style={{
              position: 'absolute', right: 30, bottom: -60,
              width: 120, height: 120, borderRadius: 60,
              background: 'rgba(255,255,255,0.03)',
            }} />

            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                나만의 리멤버
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginTop: 12 }}>
                김정훈
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 3, letterSpacing: -0.2 }}>
                Product Designer · 스튜디오 오
              </div>

              <div style={{
                marginTop: 28, paddingTop: 18,
                borderTop: '0.5px solid rgba(255,255,255,0.15)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.15 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  junghoon@studio-oh.kr
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.15 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  010-2345-6789
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 공유 URL */}
        <div style={{
          margin: '16px 20px 0', padding: '12px 14px',
          background: '#fff', borderRadius: 12,
          border: '0.5px solid rgba(60,60,67,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
            letterSpacing: 0.3, textTransform: 'uppercase',
          }}>URL</div>
          <div style={{
            flex: 1, fontSize: 12, fontFamily: 'SF Mono, ui-monospace, monospace',
            color: NAVY, letterSpacing: -0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>remember.app/p/junghoon-kim</div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </div>

        {/* 액션 */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
          <div style={{
            flex: 1, padding: '12px 0', textAlign: 'center',
            background: NAVY, color: '#fff',
            borderRadius: 12, fontSize: 14, fontWeight: 600, letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(27,42,78,0.2)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            공유하기
          </div>
          <div style={{
            padding: '12px 16px', textAlign: 'center',
            background: '#fff', border: '0.5px solid rgba(60,60,67,0.12)',
            borderRadius: 12, fontSize: 14, fontWeight: 500, color: INK,
            letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a9 9 0 1 0 9-9" /><polyline points="3 4 3 9 8 9" />
            </svg>
            QR 코드
          </div>
        </div>

        {/* 편집 링크 */}
        <div style={{
          padding: '28px 20px 0', textAlign: 'center',
          fontSize: 14, color: NAVY_SOFT, fontWeight: 500, letterSpacing: -0.1,
        }}>
          설정에서 내 정보 편집
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── B: 공개 페이지 (상대방 시점) ───────────
function PublicView() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 40 }}>
        {/* 명함 카드 (동일 디자인) */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            background: NAVY, borderRadius: 20, padding: '32px 24px',
            color: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(27,42,78,0.3)',
          }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                나만의 리멤버
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginTop: 12 }}>
                김정훈
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 3, letterSpacing: -0.2 }}>
                Product Designer · 스튜디오 오
              </div>
            </div>
          </div>
        </div>

        {/* 연락 액션 (큰 버튼) */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '이메일 보내기', sub: 'junghoon@studio-oh.kr', icon: 'mail' },
            { label: '전화하기', sub: '010-2345-6789', icon: 'phone' },
            { label: '연락처에 저장', sub: 'VCF 파일 다운로드', icon: 'user-plus' },
          ].map(a => (
            <div key={a.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: '#fff', borderRadius: 14,
              border: '0.5px solid rgba(60,60,67,0.08)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(27,42,78,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  {a.icon === 'mail' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                  {a.icon === 'phone' && <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />}
                  {a.icon === 'user-plus' && <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>}
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: INK, letterSpacing: -0.2 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 1, letterSpacing: -0.1 }}>{a.sub}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div style={{
          padding: '32px 20px 0', textAlign: 'center',
          fontSize: 12, color: 'rgba(60,60,67,0.5)', letterSpacing: -0.1,
        }}>
          <span style={{ fontWeight: 500 }}>나만의 리멤버</span>로 만들어진 명함
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── C: 설정 (프로필 편집) ──────────────────
function SettingsPage() {
  const Field = ({ label, value, required }) => (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
      }}>
        {label} {required && <span style={{ color: NAVY }}>*</span>}
      </div>
      <div style={{
        padding: '10px 14px', background: '#fff', borderRadius: 10,
        fontSize: 15, color: INK, letterSpacing: -0.2,
        border: '0.5px solid rgba(60,60,67,0.08)',
      }}>{value}</div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: NAVY,
        letterSpacing: 0.5, textTransform: 'uppercase',
        padding: '0 4px 10px',
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );

  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 60, paddingBottom: 100 }}>
        {/* 헤더 */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            설정
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: INK, letterSpacing: -0.5, marginTop: 4 }}>
            내 정보 · 데이터
          </div>
        </div>

        {/* 내 정보 */}
        <div style={{ padding: '0 16px' }}>
          <Section title="내 정보">
            <Field label="이름" value="김정훈" required />
            <Field label="회사" value="스튜디오 오" />
            <Field label="직책" value="Product Designer" />
            <Field label="이메일" value="junghoon@studio-oh.kr" />
            <Field label="전화" value="010-2345-6789" />
          </Section>

          {/* 공개 주소 (특수 처리) */}
          <Section title="공개 주소">
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
              }}>SLUG</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '10px 14px', background: '#fff', borderRadius: 10,
                  fontSize: 14, fontFamily: 'SF Mono, ui-monospace, monospace',
                  color: NAVY, letterSpacing: -0.1,
                  border: '0.5px solid rgba(60,60,67,0.08)',
                }}>junghoon-kim</div>
                <div style={{
                  padding: '10px 14px', textAlign: 'center',
                  background: 'transparent', color: NAVY,
                  border: `0.5px solid rgba(27,42,78,0.25)`,
                  borderRadius: 10, fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                }}>새로 생성</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(60,60,67,0.55)', marginTop: 4, letterSpacing: -0.1 }}>
                영문 소문자, 숫자, 하이픈만
              </div>
            </div>

            <div style={{
              padding: '12px 14px', background: 'rgba(27,42,78,0.05)',
              borderRadius: 10, fontSize: 12, color: NAVY_SOFT, letterSpacing: -0.1,
              fontFamily: 'SF Mono, ui-monospace, monospace',
            }}>remember.app/p/junghoon-kim</div>
          </Section>

          {/* 저장 */}
          <div style={{
            padding: '14px 0', textAlign: 'center',
            background: NAVY, color: '#fff',
            borderRadius: 12, fontSize: 15, fontWeight: 600, letterSpacing: -0.2,
            boxShadow: '0 4px 12px rgba(27,42,78,0.2)',
            marginBottom: 28,
          }}>저장</div>

          {/* 데이터 */}
          <Section title="데이터">
            <div style={{
              padding: '14px 16px', background: '#fff', borderRadius: 12,
              border: '0.5px solid rgba(60,60,67,0.08)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(27,42,78,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: INK, letterSpacing: -0.2 }}>CSV로 내보내기</div>
                <div style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', marginTop: 1, letterSpacing: -0.1 }}>
                  저장한 모든 명함 다운로드
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(60,60,67,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Section>

          {/* 계정 */}
          <Section title="계정">
            <div style={{
              padding: '14px 16px', background: '#fff', borderRadius: 12,
              border: '0.5px solid rgba(60,60,67,0.08)',
              textAlign: 'center', fontSize: 15, color: 'rgba(60,60,67,0.7)',
              fontWeight: 500, letterSpacing: -0.2,
            }}>로그아웃</div>
          </Section>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { MyCard, PublicView, SettingsPage });
