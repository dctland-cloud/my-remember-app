// 스캔 플로우 v2 — 4개 상태 (촬영 / 분석중 / 편집+키워드 / 저장완료)
// B안 톤: 페이퍼 배경, 딥 네이비 악센트

const NAVY = '#1B2A4E';
const NAVY_SOFT = '#2C3E6B';
const INK = '#1C1C1E';
const PAPER = '#F5F3EE';
const PAPER_2 = '#EEE9E0';

// ─── 공통 ─────────────────────────────────────
function ScanHeader({ title, step, total = 4 }) {
  return (
    <div style={{ padding: '8px 20px 0' }}>
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'rgba(60,60,67,0.55)',
        letterSpacing: 0.5, textTransform: 'uppercase',
      }}>
        STEP {step} / {total}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 700, color: INK,
        letterSpacing: -0.5, marginTop: 4,
      }}>{title}</div>
    </div>
  );
}

function ScanProgressBar({ step, total = 4 }) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '14px 20px 0',
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < step ? NAVY : 'rgba(60,60,67,0.12)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ─── STEP 1: 촬영 ────────────────────────────
function ScanStep1() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <ScanHeader title="명함 촬영" step={1} />
        <ScanProgressBar step={1} />

        {/* 카메라 뷰파인더 */}
        <div style={{ padding: '32px 20px 0' }}>
          <div style={{
            width: '100%', aspectRatio: '1 / 1.2',
            background: '#1A1A1C',
            borderRadius: 22, position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}>
            {/* 코너 가이드 */}
            {[
              { top: 20, left: 20, borderTop: '2px solid #fff', borderLeft: '2px solid #fff' },
              { top: 20, right: 20, borderTop: '2px solid #fff', borderRight: '2px solid #fff' },
              { bottom: 20, left: 20, borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' },
              { bottom: 20, right: 20, borderBottom: '2px solid #fff', borderRight: '2px solid #fff' },
            ].map((s, i) => (
              <div key={i} style={{
                position: 'absolute', width: 28, height: 28,
                borderTopLeftRadius: s.borderTop && s.borderLeft ? 6 : 0,
                borderTopRightRadius: s.borderTop && s.borderRight ? 6 : 0,
                borderBottomLeftRadius: s.borderBottom && s.borderLeft ? 6 : 0,
                borderBottomRightRadius: s.borderBottom && s.borderRight ? 6 : 0,
                ...s,
              }} />
            ))}
            {/* 안내 텍스트 */}
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0,
              transform: 'translateY(-50%)',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)', fontSize: 13,
              letterSpacing: -0.2,
            }}>
              명함을 프레임 안에 맞춰주세요
            </div>
          </div>
        </div>

        {/* 촬영 버튼 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 40, padding: '40px 20px 0',
        }}>
          {/* 갤러리 */}
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,0.9)',
            border: '0.5px solid rgba(60,60,67,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          {/* 셔터 */}
          <div style={{
            width: 76, height: 76, borderRadius: 38,
            background: '#fff',
            border: `3px solid ${NAVY}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(27,42,78,0.25)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 30,
              background: NAVY,
            }} />
          </div>
          {/* 카메라 전환 (비활성 자리) */}
          <div style={{ width: 48, height: 48, opacity: 0 }} />
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── STEP 2: 분석 중 ───────────────────────
function ScanStep2() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <ScanHeader title="AI 분석 중" step={2} />
        <ScanProgressBar step={2} />

        {/* 촬영한 명함 미리보기 */}
        <div style={{
          display: 'flex', justifyContent: 'center', padding: '36px 20px 0',
        }}>
          <div style={{
            width: 240, aspectRatio: '1.6 / 1',
            borderRadius: 14, background: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 16, position: 'relative', overflow: 'hidden',
          }}>
            {/* 가짜 명함 내용 */}
            <div style={{ fontSize: 10, color: 'rgba(60,60,67,0.5)', letterSpacing: 1 }}>TOSS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginTop: 6 }}>김민준</div>
            <div style={{ fontSize: 11, color: 'rgba(60,60,67,0.7)', marginTop: 2 }}>Product Designer</div>
            <div style={{
              position: 'absolute', bottom: 14, left: 16, fontSize: 10,
              color: 'rgba(60,60,67,0.55)',
            }}>minjun@toss.im</div>

            {/* 스캐닝 라인 애니메이션 (정적 표현) */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: '55%',
              height: 2, background: NAVY, opacity: 0.6,
              boxShadow: `0 0 12px ${NAVY}`,
            }} />
            {/* 오버레이 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(180deg, transparent 40%, rgba(27,42,78,0.08) 55%, transparent 70%)`,
            }} />
          </div>
        </div>

        {/* 로딩 + 상태 */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, padding: '36px 20px 0',
        }}>
          <div style={{
            position: 'relative', width: 28, height: 28,
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `3px solid rgba(27,42,78,0.15)`,
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `3px solid transparent`, borderTopColor: NAVY,
              animation: 'spin 1s linear infinite',
            }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: INK, letterSpacing: -0.2 }}>
            명함을 읽고 있어요
          </div>
          <div style={{ fontSize: 13, color: 'rgba(60,60,67,0.6)', letterSpacing: -0.1 }}>
            이름 · 회사 · 연락처를 자동으로 추출합니다
          </div>
        </div>

        {/* 진행 단계 체크리스트 */}
        <div style={{
          margin: '32px 36px 0', padding: '14px 16px',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: 12,
          fontSize: 13,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {[
            { label: '이미지 업로드', done: true },
            { label: '텍스트 인식', done: true },
            { label: '정보 추출', done: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9, flexShrink: 0,
                background: s.done ? NAVY : 'transparent',
                border: s.done ? 'none' : `1.5px solid rgba(60,60,67,0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ color: s.done ? INK : 'rgba(60,60,67,0.55)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── STEP 3: 편집 + 키워드 ───────────────────
function ScanStep3() {
  const suggestedTags = ['CES 2026', '오늘 저장', '디자이너'];
  const addedTags = ['CES 2026', '디자이너'];
  const recentTags = ['박사', '회사 동료', 'AI', '개발자 컨퍼런스'];

  const Field = ({ label, value }) => (
    <div style={{ marginBottom: 12 }}>
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
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52, paddingBottom: 100 }}>
        <ScanHeader title="확인 · 저장" step={3} />
        <ScanProgressBar step={3} />

        {/* 썸네일 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 20px 0' }}>
          <div style={{
            width: 180, aspectRatio: '1.6 / 1',
            borderRadius: 10, background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: 12,
          }}>
            <div style={{ fontSize: 8, color: 'rgba(60,60,67,0.5)', letterSpacing: 1 }}>TOSS</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginTop: 4 }}>김민준</div>
            <div style={{ fontSize: 9, color: 'rgba(60,60,67,0.7)', marginTop: 1 }}>Product Designer</div>
          </div>
        </div>

        {/* 폼 */}
        <div style={{ padding: '20px 20px 0' }}>
          <Field label="이름" value="김민준" />
          <Field label="회사" value="토스" />
          <Field label="직책" value="Product Designer" />
          <Field label="이메일" value="minjun@toss.im" />
          <Field label="전화" value="010-1234-5678" />
        </div>

        {/* 기억 키워드 섹션 */}
        <div style={{
          margin: '16px 20px 0',
          padding: '16px 16px',
          background: 'rgba(27,42,78,0.04)',
          borderRadius: 14,
          border: `0.5px solid rgba(27,42,78,0.12)`,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: NAVY,
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4,
          }}>기억 키워드</div>
          <div style={{
            fontSize: 12, color: 'rgba(60,60,67,0.7)',
            letterSpacing: -0.1, marginBottom: 12, lineHeight: 1.45,
          }}>
            이 사람을 어떻게 기억하고 싶은가요? 장소, 역할, 프로젝트 등 자유롭게.
          </div>

          {/* 선택된 태그 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {addedTags.map(t => (
              <div key={t} style={{
                padding: '5px 10px 5px 12px', borderRadius: 9999,
                background: NAVY, color: '#fff',
                fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {t}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </div>
            ))}
            {/* 입력 필드 */}
            <div style={{
              padding: '5px 10px', borderRadius: 9999,
              background: '#fff',
              border: `1px dashed rgba(27,42,78,0.3)`,
              fontSize: 12, color: 'rgba(60,60,67,0.55)',
              letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              + 키워드 추가
            </div>
          </div>

          {/* 제안 */}
          <div style={{
            fontSize: 10, fontWeight: 600, color: 'rgba(60,60,67,0.55)',
            letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6,
          }}>최근 사용</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {recentTags.map(t => (
              <div key={t} style={{
                padding: '4px 10px', borderRadius: 9999,
                background: 'rgba(255,255,255,0.9)',
                color: 'rgba(60,60,67,0.75)',
                fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                border: '0.5px solid rgba(60,60,67,0.12)',
              }}>+ {t}</div>
            ))}
          </div>
        </div>

        {/* 하단 CTA 고정 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 20px 32px',
          background: `linear-gradient(to bottom, rgba(245,243,238,0) 0%, ${PAPER} 40%)`,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              flex: '0 0 100px', padding: '14px 0', textAlign: 'center',
              background: '#fff', border: '0.5px solid rgba(60,60,67,0.12)',
              borderRadius: 12, fontSize: 15, fontWeight: 500,
              color: 'rgba(60,60,67,0.75)', letterSpacing: -0.2,
            }}>다시 촬영</div>
            <div style={{
              flex: 1, padding: '14px 0', textAlign: 'center',
              background: NAVY, color: '#fff',
              borderRadius: 12, fontSize: 15, fontWeight: 600, letterSpacing: -0.2,
              boxShadow: '0 6px 16px rgba(27,42,78,0.25)',
            }}>저장하기</div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── STEP 4: 저장 완료 + 이메일 제안 ───────
function ScanStep4() {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ position: 'absolute', inset: 0, background: PAPER, zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 52 }}>
        <ScanProgressBar step={4} />

        {/* 성공 메시지 */}
        <div style={{
          padding: '60px 20px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: NAVY, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 24px rgba(27,42,78,0.25)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700, color: INK,
            letterSpacing: -0.4, marginBottom: 6,
          }}>저장되었습니다</div>
          <div style={{
            fontSize: 14, color: 'rgba(60,60,67,0.65)',
            letterSpacing: -0.2, lineHeight: 1.5, maxWidth: 260,
          }}>
            <span style={{ color: INK, fontWeight: 500 }}>김민준</span>님의 명함이<br />
            <span style={{ color: NAVY, fontWeight: 500 }}>CES 2026</span>,
            <span style={{ color: NAVY, fontWeight: 500 }}> 디자이너</span> 키워드로 저장되었어요
          </div>
        </div>

        {/* 이메일 제안 카드 */}
        <div style={{
          margin: '36px 20px 0',
          padding: '18px 18px',
          background: '#fff', borderRadius: 16,
          border: '0.5px solid rgba(60,60,67,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(27,42,78,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: INK, letterSpacing: -0.2 }}>
              인사 이메일을 보낼까요?
            </div>
          </div>
          <div style={{
            fontSize: 13, color: 'rgba(60,60,67,0.7)',
            letterSpacing: -0.15, lineHeight: 1.5, marginBottom: 14,
          }}>
            오늘 받은 명함, 기억이 생생할 때 간단히 인사를 남기면 다음에 다시 만날 확률이 올라갑니다.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: 'transparent', color: 'rgba(60,60,67,0.7)',
              border: '0.5px solid rgba(60,60,67,0.15)',
              borderRadius: 10, fontSize: 14, fontWeight: 500, letterSpacing: -0.2,
            }}>나중에</div>
            <div style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: NAVY, color: '#fff',
              borderRadius: 10, fontSize: 14, fontWeight: 600, letterSpacing: -0.2,
            }}>작성하기</div>
          </div>
        </div>

        {/* 보조 액션 */}
        <div style={{
          margin: '24px 20px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            fontSize: 14, color: NAVY_SOFT, fontWeight: 500, letterSpacing: -0.1,
          }}>목록으로 돌아가기</div>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { ScanStep1, ScanStep2, ScanStep3, ScanStep4 });
