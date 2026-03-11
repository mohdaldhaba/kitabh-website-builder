import React, { useState, useEffect } from 'react'

// Cups ordered: cheapest first (right side in RTL) → expensive (left side in RTL)
const TIP_OPTIONS = [
  {
    id: 'espresso',
    label: 'إسبريسو',
    amount: 5,
    image: '/images/espresso.png',
    size: 36,
  },
  {
    id: 'galao',
    label: 'قهوة وسط',
    amount: 10,
    image: '/images/galao.png',
    size: 44,
  },
  {
    id: 'lungo',
    label: 'قهوة كبيرة',
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
    background: linear-gradient(to left, #E2E8F0, #94A3B8);
    outline: none;
    direction: ltr;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1E293B;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 8px rgba(0,0,0,0.15);
  }
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1E293B;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 1px 8px rgba(0,0,0,0.15);
  }
`

const TipAuthorPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [customAmount, setCustomAmount] = useState(5)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  useEffect(() => {
    if (selectedIndex === 0) setCustomAmount(5)
    else if (selectedIndex === 1) setCustomAmount(10)
    else setCustomAmount(15)
  }, [selectedIndex])

  const handleSliderChange = (value: number) => {
    setCustomAmount(value)
    if (value <= 7) setSelectedIndex(0)
    else if (value <= 12) setSelectedIndex(1)
    else setSelectedIndex(2)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedIndex(0)
      setCustomAmount(5)
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
              {/* Name row with coffee icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#000', margin: 0 }}>
                  {DEMO_AUTHOR.name}
                </h1>
                {/* Verification badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#0000FF',
                  flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
                {/* Coffee tip icon — uses the actual espresso PNG */}
                <button
                  onClick={() => setDialogOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#F5F0EB',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    animation: 'float 2.5s ease-in-out infinite',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.12)'
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  title="ادعم الكاتب بقهوة"
                >
                  <img
                    src="/images/espresso.png"
                    alt="ادعم بقهوة"
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                  />
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0' }}>
                @{DEMO_AUTHOR.username}
              </p>
            </div>
            <img
              src={DEMO_AUTHOR.image}
              alt={DEMO_AUTHOR.name}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #F0F0F0',
              }}
            />
          </div>

          {/* Action icons */}
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

        {/* Tabs */}
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
              background: 'rgba(255, 255, 255, 0.85)',
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
            {/* Close */}
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
                {/* Header */}
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
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', letterSpacing: '-0.2px' }}>
                    ادعم {DEMO_AUTHOR.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                    اختر حجم القهوة اللي تحب تهديه
                  </div>
                </div>

                {/* Cups row — RTL: small (right) → large (left) */}
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
                          padding: '10px 16px', borderRadius: '16px', border: 'none',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                          background: isSelected ? 'rgba(30, 41, 59, 0.06)' : 'transparent',
                          outline: isSelected ? '1.5px solid rgba(30, 41, 59, 0.15)' : '1.5px solid transparent',
                        }}
                      >
                        <img
                          src={option.image}
                          alt={option.label}
                          style={{
                            width: `${option.size}px`, height: `${option.size}px`,
                            objectFit: 'contain' as const,
                            transition: 'transform 0.2s ease',
                            transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                            animation: isSelected ? 'gentleBounce 2s ease-in-out infinite' : 'none',
                          }}
                        />
                        <span style={{
                          fontSize: '11px', fontWeight: 500,
                          color: isSelected ? '#1E293B' : '#94A3B8',
                          transition: 'color 0.2s',
                        }}>
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Slider — LTR direction: left=5 (cheap), right=15 (expensive) */}
                {/* But visually in RTL page: right=cheap, left=expensive */}
                <div style={{ padding: '4px 32px 0' }}>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    step={1}
                    value={customAmount}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    style={{ width: '100%', direction: 'rtl' as const }}
                  />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '10px', color: '#CBD5E1', marginTop: '6px',
                  }}>
                    <span>15 ر.س</span>
                    <span>10 ر.س</span>
                    <span>5 ر.س</span>
                  </div>
                </div>

                {/* Amount */}
                <div style={{
                  textAlign: 'center' as const, padding: '16px 0 4px',
                  fontSize: '32px', fontWeight: 700, color: '#1E293B',
                  letterSpacing: '-0.5px',
                }}>
                  {customAmount} <span style={{ fontSize: '16px', fontWeight: 500, color: '#94A3B8' }}>ر.س</span>
                </div>

                {/* Submit */}
                <div style={{ padding: '12px 28px 28px' }}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      width: '100%', height: '46px', borderRadius: '14px',
                      border: 'none', fontSize: '15px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: '#1E293B', color: '#fff',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(30, 41, 59, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0F172A'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 41, 59, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#1E293B'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 41, 59, 0.2)'
                    }}
                  >
                    ادعم بـ {customAmount} ر.س
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
                  alt="coffee"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' as const }}
                />
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginTop: '4px' }}>
                  شكراً لدعمك!
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                  قهوتك وصلت — {DEMO_AUTHOR.name} يقدّر دعمك
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
