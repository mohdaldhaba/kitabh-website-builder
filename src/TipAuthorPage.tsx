import React, { useState, useEffect } from 'react'

// Order: وسط (right) → إسبريسو (middle) → كبيرة (left)
const TIP_OPTIONS = [
  {
    id: 'galao',
    amount: 10,
    image: '/images/galao.png',
    size: 44,
  },
  {
    id: 'espresso',
    amount: 5,
    image: '/images/espresso.png',
    size: 36,
  },
  {
    id: 'lungo',
    amount: 15,
    image: '/images/lungo.png',
    size: 52,
  },
]

const DEMO_AUTHOR = {
  name: 'عبدالله الحواس',
  username: 'hawas55',
  image: '/images/author.jpg',
  bio: 'كاتب وروائي، أمارس الكتابة بلا وعي! وإنما استجابة لحاجة داخلية.',
  subscribers: 127,
  followers: 59,
  following: 16,
  newsletter: { name: 'سنارة' },
}

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, -46%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  @keyframes gentleBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #E2E8F0;
    outline: none;
    direction: ltr;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #0000FF;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 8px rgba(0,0,255,0.2);
  }
  input[type="range"]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #0000FF;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 8px rgba(0,0,255,0.2);
  }
`

const TipAuthorPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // Slider snaps to 3 positions only: 0, 1, 2
  const handleSliderChange = (value: number) => {
    setSelectedIndex(value)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedIndex(0)
    }, 300)
  }

  const selectedOption = TIP_OPTIONS[selectedIndex]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
      direction: 'rtl' as const,
    }}>
      {/* Author Profile Mockup */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        background: '#fff',
        minHeight: '100vh',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #F0F0F0',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0000FF' }}>
            كتابة :&gt;
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0F0F0' }} />
        </div>

        {/* Author Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          margin: '16px',
          border: '1px solid #E8E8E8',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#000', margin: 0 }}>
                  {DEMO_AUTHOR.name}
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '50%', background: '#0000FF', flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
                <button
                  onClick={() => setDialogOpen(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '30px', height: '30px', borderRadius: '50%', background: '#F5F0EB',
                    border: 'none', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                    animation: 'float 2.5s ease-in-out infinite', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  title="ادعم الكاتب بقهوة"
                >
                  <img src="/images/espresso.png" alt="ادعم بقهوة" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0' }}>@{DEMO_AUTHOR.username}</p>
            </div>
            <img src={DEMO_AUTHOR.image} alt={DEMO_AUTHOR.name} style={{
              width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F0F0F0',
            }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#F0F0F0', borderRadius: '100px', padding: '6px 12px',
            }}>
              <img src={DEMO_AUTHOR.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{DEMO_AUTHOR.newsletter.name}</span>
            </div>
            {['🔗', '⬇', '📋'].map((icon, i) => (
              <div key={i} style={{
                width: '31px', height: '31px', borderRadius: '50%', background: '#F0F0F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px',
              }}>{icon}</div>
            ))}
          </div>

          <p style={{ fontSize: '14px', color: '#27262B', marginTop: '16px', lineHeight: 1.7, textAlign: 'center' }}>
            {DEMO_AUTHOR.bio}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.subscribers}</strong> مشترك</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.followers}</strong> متابع</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.following}</strong> يتابع</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button style={{
              flex: 1, height: '42px', borderRadius: '10px', border: '1px solid #E0E0E0',
              background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>إلغاء المتابعة</button>
            <button style={{
              flex: 1, height: '42px', borderRadius: '10px', border: '1px solid #E0E0E0',
              background: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>انضمام للنشرة 📩</button>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '2px solid #F0F0F0', padding: '0 16px' }}>
          {['النصوص', 'الأفكار', 'التعليقات', 'عن الكاتب'].map((tab, i) => (
            <div key={tab} style={{
              padding: '12px 16px', fontSize: '14px',
              fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#000' : '#888',
              borderBottom: i === 0 ? '2px solid #000' : 'none', cursor: 'pointer',
            }}>{tab}</div>
          ))}
        </div>
      </div>

      {/* ========== TIP DIALOG ========== */}
      {dialogOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            animation: 'overlayIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
              maxWidth: '380px',
              width: 'calc(100% - 40px)',
              animation: 'slideUp 0.3s ease',
              overflow: 'hidden',
              direction: 'rtl' as const,
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', top: '14px', left: '14px',
                width: '28px', height: '28px', borderRadius: '50%',
                border: 'none', background: 'rgba(0,0,0,0.05)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', color: '#999', zIndex: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
            >✕</button>

            {!submitted ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ padding: '28px 28px 8px', textAlign: 'center' as const }}>
                  <img
                    src={DEMO_AUTHOR.image}
                    alt={DEMO_AUTHOR.name}
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'block', margin: '0 auto 12px',
                    }}
                  />
                  <div style={{ fontSize: '17px', fontWeight: 600, color: '#1E293B' }}>
                    هل تريد دعم {DEMO_AUTHOR.name} ليستمر في النشر؟
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px', lineHeight: 1.6 }}>
                    نختبر هذه الميزة لمعرفة رأيك — اختر المبلغ الذي تراه مناسباً
                  </div>
                </div>

                {/* Cups: وسط (right) → إسبريسو (middle) → كبيرة (left) */}
                <div style={{
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  gap: '8px', padding: '20px 24px 12px',
                }}>
                  {TIP_OPTIONS.map((option, index) => {
                    const isSelected = selectedIndex === index
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedIndex(index)}
                        style={{
                          display: 'flex', flexDirection: 'column' as const,
                          alignItems: 'center', gap: '6px',
                          padding: '10px 18px', borderRadius: '16px', border: 'none',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                          background: isSelected ? 'rgba(0, 0, 255, 0.05)' : 'transparent',
                          outline: isSelected ? '1.5px solid rgba(0, 0, 255, 0.2)' : '1.5px solid transparent',
                        }}
                      >
                        <img
                          src={option.image}
                          alt=""
                          style={{
                            width: `${option.size}px`, height: `${option.size}px`,
                            objectFit: 'contain' as const,
                            transition: 'transform 0.2s ease',
                            transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                            animation: isSelected ? 'gentleBounce 2s ease-in-out infinite' : 'none',
                          }}
                        />
                        <span style={{
                          fontSize: '13px', fontWeight: 600,
                          color: isSelected ? '#0000FF' : '#94A3B8',
                          transition: 'color 0.2s',
                        }}>
                          {option.amount} ر.س
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Slider — snaps to 3 positions only */}
                <div style={{ padding: '4px 40px 0' }}>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={1}
                    value={selectedIndex}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    style={{ width: '100%', direction: 'rtl' as const }}
                  />
                </div>

                {/* Amount */}
                <div style={{
                  textAlign: 'center' as const, padding: '18px 0 4px',
                  fontSize: '32px', fontWeight: 700, color: '#1E293B',
                }}>
                  {selectedOption.amount} <span style={{ fontSize: '16px', fontWeight: 500, color: '#94A3B8' }}>ر.س</span>
                </div>

                <div style={{ padding: '12px 28px 28px' }}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      width: '100%', height: '46px', borderRadius: '14px',
                      border: 'none', fontSize: '15px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: '#0000FF', color: '#fff',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0, 0, 255, 0.25)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0000CC'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 255, 0.35)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0000FF'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 255, 0.25)'
                    }}
                  >
                    أرغب بدعمه بـ {selectedOption.amount} ر.س
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '44px 28px', textAlign: 'center' as const,
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', gap: '10px', animation: 'scaleIn 0.3s ease',
              }}>
                <img
                  src={selectedOption?.image}
                  alt=""
                  style={{ width: '56px', height: '56px', objectFit: 'contain' as const }}
                />
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginTop: '4px' }}>
                  شكراً لمشاركتك!
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '280px' }}>
                  سنعمل على تحسين التجربة لدعم كتّاب المنصة. رأيك يساعدنا نبني ميزة أفضل.
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    marginTop: '12px', padding: '10px 28px', borderRadius: '12px',
                    border: '1.5px solid #E2E8F0', background: 'transparent',
                    color: '#1E293B', fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  تمام
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TipAuthorPage
