import React, { useState, useEffect, useRef } from 'react'

// Cups ordered: cheapest first (renders right-to-left in RTL)
const TIP_OPTIONS = [
  {
    id: 'espresso',
    label: 'إسبريسو',
    amount: 5,
    image: '/images/espresso.png',
    size: 48,
  },
  {
    id: 'galao',
    label: 'قهوة وسط',
    amount: 10,
    image: '/images/galao.png',
    size: 64,
  },
  {
    id: 'lungo',
    label: 'قهوة كبيرة',
    amount: 15,
    image: '/images/lungo.png',
    size: 80,
  },
]

const DEMO_AUTHOR = {
  name: 'عبدالله الحواس',
  username: 'hawas55',
  image: 'https://pbs.twimg.com/profile_images/1847718041953124352/Jl0Y990s_400x400.jpg',
  bio: 'كاتب وروائي، أمارس الكتابة بلا وعي! وإنما استجابة لحاجة داخلية.',
  subscribers: 127,
  followers: 59,
  following: 16,
  newsletter: { name: 'سنارة', logo: 'https://pbs.twimg.com/profile_images/1847718041953124352/Jl0Y990s_400x400.jpg' },
}

const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

  @keyframes wiggle {
    0%, 100% { transform: translateY(-4px) rotate(0deg); }
    25% { transform: translateY(-6px) rotate(-3deg); }
    75% { transform: translateY(-6px) rotate(3deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translate(-50%, -45%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139, 94, 60, 0.3); }
    50% { box-shadow: 0 0 0 6px rgba(139, 94, 60, 0); }
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #E8DDD4;
    outline: none;
    direction: ltr;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #8B5E3C;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #8B5E3C;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
`

// Coffee icon SVG (simple cup outline)
const CoffeeIconSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" y1="2" x2="6" y2="4"/>
    <line x1="10" y1="2" x2="10" y2="4"/>
    <line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
)

const TipAuthorPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0) // 0=espresso, 1=galao, 2=lungo
  const [submitted, setSubmitted] = useState(false)
  const [customAmount, setCustomAmount] = useState(5)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // Sync slider with cup selection
  useEffect(() => {
    if (selectedIndex === 0) setCustomAmount(5)
    else if (selectedIndex === 1) setCustomAmount(10)
    else setCustomAmount(15)
  }, [selectedIndex])

  const handleSliderChange = (value: number) => {
    setCustomAmount(value)
    if (value <= 6) setSelectedIndex(0)
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
      {/* Mockup Author Profile */}
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0F0F0' }} />
          </div>
        </div>

        {/* Author Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          margin: '16px',
          border: '1px solid #E8E8E8',
        }}>
          {/* Profile row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {/* Name + Coffee icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#000', margin: 0 }}>
                  {DEMO_AUTHOR.name}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#0000FF',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>

                {/* Coffee tip button */}
                <button
                  onClick={() => setDialogOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: '#F5EDE4',
                    border: 'none',
                    cursor: 'pointer',
                    animation: 'pulse 2s ease-in-out infinite',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="ادعم الكاتب بقهوة"
                >
                  <div style={{ animation: 'float 2s ease-in-out infinite' }}>
                    <CoffeeIconSVG />
                  </div>
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

          {/* Icon buttons row */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F0F0F0',
              borderRadius: '100px',
              padding: '6px 12px',
            }}>
              <img src={DEMO_AUTHOR.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{DEMO_AUTHOR.newsletter.name}</span>
            </div>
            {['🔗', '⬇', '📋'].map((icon, i) => (
              <div key={i} style={{
                width: '31px',
                height: '31px',
                borderRadius: '50%',
                background: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
                {icon}
              </div>
            ))}
          </div>

          {/* Bio */}
          <p style={{ fontSize: '14px', color: '#27262B', marginTop: '16px', lineHeight: 1.7, textAlign: 'center' }}>
            {DEMO_AUTHOR.bio}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }}>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.subscribers}</strong> مشترك</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.followers}</strong> متابع</span>
            <span style={{ color: '#ddd' }}>|</span>
            <span><strong style={{ color: '#111' }}>{DEMO_AUTHOR.following}</strong> يتابع</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button style={{
              flex: 1,
              height: '42px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              إلغاء المتابعة
            </button>
            <button style={{
              flex: 1,
              height: '42px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}>
              انضمام للنشرة 📩
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #F0F0F0',
          padding: '0 16px',
        }}>
          {['النصوص', 'الأفكار', 'التعليقات', 'عن الكاتب'].map((tab, i) => (
            <div key={tab} style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? '#000' : '#888',
              borderBottom: i === 0 ? '2px solid #000' : 'none',
              cursor: 'pointer',
            }}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* TIP DIALOG OVERLAY */}
      {dialogOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            animation: 'overlayIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '400px',
              width: 'calc(100% - 32px)',
              animation: 'slideUp 0.3s ease',
              overflow: 'hidden',
              direction: 'rtl' as const,
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: '#F0F0F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#666',
                zIndex: 10,
              }}
            >
              ✕
            </button>

            {!submitted ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Dialog header */}
                <div style={{ padding: '28px 28px 12px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#371D12' }}>
                    ادعم {DEMO_AUTHOR.name} بقهوة
                  </div>
                  <div style={{ fontSize: '13px', color: '#999', marginTop: '6px', lineHeight: 1.6 }}>
                    أعجبك محتواه؟ ادعمه بكوب قهوة عشان يكمّل إبداع
                  </div>
                </div>

                {/* Coffee cups - cheapest on right (RTL), expensive on left */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                }}>
                  {TIP_OPTIONS.map((option, index) => {
                    const isSelected = selectedIndex === index
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedIndex(index)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column' as const,
                          alignItems: 'center',
                          gap: '6px',
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          background: isSelected ? '#F5EDE4' : 'transparent',
                          outline: isSelected ? '2px solid #8B5E3C' : '2px solid transparent',
                        }}
                      >
                        <img
                          src={option.image}
                          alt={option.label}
                          style={{
                            width: `${option.size}px`,
                            height: `${option.size}px`,
                            objectFit: 'contain' as const,
                            transition: 'transform 0.3s ease',
                            transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                            animation: isSelected ? 'wiggle 1.5s ease-in-out infinite' : 'none',
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#371D12' }}>
                          {option.label}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          padding: '3px 12px',
                          background: isSelected ? '#8B5E3C' : '#F0F0F0',
                          color: isSelected ? '#fff' : '#371D12',
                          transition: 'all 0.25s ease',
                        }}>
                          {option.amount} ر.س
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Slider scale */}
                <div style={{ padding: '8px 32px 4px' }}>
                  <input
                    type="range"
                    min={5}
                    max={15}
                    step={1}
                    value={customAmount}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#BBB',
                    marginTop: '4px',
                    direction: 'ltr' as const,
                  }}>
                    <span>5 ر.س</span>
                    <span>10 ر.س</span>
                    <span>15 ر.س</span>
                  </div>
                </div>

                {/* Amount display */}
                <div style={{ textAlign: 'center' as const, padding: '12px 0 4px', fontSize: '28px', fontWeight: 700, color: '#8B5E3C' }}>
                  {customAmount} ر.س
                </div>

                {/* Submit */}
                <div style={{ padding: '12px 28px 28px' }}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '100px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: '#8B5E3C',
                      color: '#fff',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#6D4A2F')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#8B5E3C')}
                  >
                    ادعم بـ {customAmount} ر.س
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '48px 28px',
                textAlign: 'center' as const,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: '12px',
                animation: 'scaleIn 0.3s ease',
              }}>
                <img
                  src={selectedOption?.image}
                  alt="coffee"
                  style={{
                    width: '88px',
                    height: '88px',
                    objectFit: 'contain' as const,
                    animation: 'wiggle 0.8s ease',
                  }}
                />
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#371D12' }}>
                  شكراً لدعمك!
                </div>
                <div style={{ fontSize: '14px', color: '#999', lineHeight: 1.6 }}>
                  قهوتك وصلت! {DEMO_AUTHOR.name} يقدّر دعمك
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    marginTop: '8px',
                    padding: '10px 32px',
                    borderRadius: '100px',
                    border: '2px solid #8B5E3C',
                    background: 'transparent',
                    color: '#8B5E3C',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
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
