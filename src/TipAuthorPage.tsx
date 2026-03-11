import React, { useState, useEffect } from 'react'

const TIP_OPTIONS = [
  {
    id: 'lungo',
    label: 'قهوة كبيرة',
    amount: 15,
    image: '/images/lungo.png',
    size: 90,
    description: 'دعم كبير يسعد الكاتب',
  },
  {
    id: 'galao',
    label: 'قهوة وسط',
    amount: 10,
    image: '/images/galao.png',
    size: 72,
    description: 'دعم جميل يحفّز الكاتب',
  },
  {
    id: 'espresso',
    label: 'إسبريسو',
    amount: 5,
    image: '/images/espresso.png',
    size: 56,
    description: 'دعم بسيط يعني الكثير',
  },
]

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FAFAF8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'IBM Plex Sans Arabic', 'Brando Arabic', sans-serif",
    direction: 'rtl',
    padding: '20px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '440px',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: '32px 32px 16px',
    textAlign: 'center' as const,
  },
  authorImage: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '3px solid #F5EDE4',
    margin: '0 auto 12px',
    display: 'block',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#371D12',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8C8C8C',
    lineHeight: 1.6,
  },
  cupsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px 32px',
  },
  cupButton: (isSelected: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isSelected ? '#F5EDE4' : 'transparent',
    outline: isSelected ? '2px solid #8B5E3C' : '2px solid transparent',
  }),
  cupImage: (size: number, isSelected: boolean) => ({
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain' as const,
    transition: 'transform 0.3s ease',
    transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
    animation: isSelected ? 'wiggle 1.5s ease-in-out infinite' : 'none',
  }),
  cupLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#371D12',
  },
  cupAmount: (isSelected: boolean) => ({
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: '20px',
    padding: '4px 14px',
    background: isSelected ? '#8B5E3C' : '#F0F0F0',
    color: isSelected ? '#FFFFFF' : '#371D12',
    transition: 'all 0.3s ease',
  }),
  footer: {
    padding: '0 32px 32px',
  },
  submitButton: (isActive: boolean) => ({
    width: '100%',
    height: '48px',
    borderRadius: '100px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: isActive ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    background: isActive ? '#8B5E3C' : '#E5E5E5',
    color: isActive ? '#FFFFFF' : '#AAAAAA',
    fontFamily: 'inherit',
  }),
  thankYou: {
    padding: '48px 32px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  thankYouText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#371D12',
    lineHeight: 1.8,
  },
  thankYouSub: {
    fontSize: '14px',
    color: '#8C8C8C',
  },
  doneButton: {
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
    transition: 'all 0.2s ease',
  },
  coffeeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#F5EDE4',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s ease',
    animation: 'float 2s ease-in-out infinite',
  },
}

const keyframes = `
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
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
`

// Demo author data — replace with real data from props/API
const DEMO_AUTHOR = {
  name: 'محمد الضبع',
  image: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF&background=8B5E3C&color=fff&size=150&font-size=0.4',
  bio: 'مؤسِّس منصة كتابة',
}

const TipAuthorPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [hoveredButton, setHoveredButton] = useState(false)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const handleSubmit = () => {
    if (!selected) return
    // TODO: integrate with payment provider
    setSubmitted(true)
  }

  const handleReset = () => {
    setSelected(null)
    setSubmitted(false)
  }

  const selectedOption = TIP_OPTIONS.find(o => o.id === selected)

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {!submitted ? (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={styles.header}>
              <img
                src={DEMO_AUTHOR.image}
                alt={DEMO_AUTHOR.name}
                style={styles.authorImage}
              />
              <div style={styles.title}>
                ادعم {DEMO_AUTHOR.name} بقهوة ☕
              </div>
              <div style={styles.subtitle}>
                أعجبك محتوى هذا الكاتب؟ ادعمه بكوب قهوة عشان يكمّل إبداع
              </div>
            </div>

            {/* Coffee Cups */}
            <div style={styles.cupsContainer}>
              {TIP_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  style={styles.cupButton(selected === option.id)}
                >
                  <img
                    src={option.image}
                    alt={option.label}
                    style={styles.cupImage(option.size, selected === option.id)}
                  />
                  <span style={styles.cupLabel}>{option.label}</span>
                  <span style={styles.cupAmount(selected === option.id)}>
                    {option.amount} ر.س
                  </span>
                </button>
              ))}
            </div>

            {/* Submit */}
            <div style={styles.footer}>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                style={styles.submitButton(!!selected)}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
              >
                {selected
                  ? `ادعم بـ ${selectedOption?.amount} ر.س`
                  : 'اختر حجم القهوة'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ ...styles.thankYou, animation: 'scaleIn 0.4s ease' }}>
            <img
              src={selectedOption?.image}
              alt="coffee"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                animation: 'wiggle 0.8s ease',
              }}
            />
            <div style={styles.thankYouText}>
              شكراً لدعمك! ☕
            </div>
            <div style={styles.thankYouSub}>
              قهوتك وصلت! {DEMO_AUTHOR.name} يقدّر دعمك
            </div>
            <button
              onClick={handleReset}
              style={styles.doneButton}
            >
              تمام
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TipAuthorPage
