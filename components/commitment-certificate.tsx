'use client'

import { useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Detailed rose vine SVG — left side decoration (matching reference) */
/* ------------------------------------------------------------------ */
function RoseVineDecoration() {
  return (
    <svg
      className="absolute left-0 top-0 h-full pointer-events-none"
      style={{ width: '35%' }}
      viewBox="0 0 260 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid slice"
      aria-hidden="true"
    >
      {/* Main vine stem — sinuous S-curve */}
      <path
        d="M130 -10 C115 40, 80 60, 95 110 C110 160, 145 140, 130 200 C115 260, 65 290, 85 350 C105 410, 140 380, 125 440 C110 500, 70 530, 90 600"
        stroke="#6B1515"
        strokeWidth="2.5"
        fill="none"
        opacity="0.85"
      />
      {/* Secondary vine — thinner parallel */}
      <path
        d="M100 -10 C85 50, 55 80, 70 130 C85 180, 115 155, 100 220 C85 285, 40 310, 60 370 C80 430, 110 400, 95 460 C80 520, 50 550, 65 610"
        stroke="#5A1010"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* Tertiary thin vine on far left */}
      <path
        d="M50 -5 C40 30, 20 55, 30 90 C40 125, 60 115, 50 160 C40 205, 15 225, 25 270 C35 315, 55 300, 45 345 C35 390, 10 415, 25 460 C40 505, 55 490, 45 535 C35 580, 20 595, 30 630"
        stroke="#4A0E0E"
        strokeWidth="1.2"
        fill="none"
        opacity="0.45"
      />

      {/* -------- ROSE 1: top area -------- */}
      <g transform="translate(85, 85)" opacity="0.9">
        {/* Outer petals */}
        <path d="M0,-16 C8,-14 14,-8 12,0 C10,8 4,12 0,10 C-4,12 -10,8 -12,0 C-14,-8 -8,-14 0,-16Z" fill="#7A1818" />
        <path d="M-14,-6 C-10,-14 -2,-16 4,-12 C10,-8 12,-2 8,4 C4,10 -4,14 -8,10 C-12,6 -14,0 -14,-6Z" fill="#8B1E1E" />
        <path d="M14,-6 C10,-14 2,-16 -4,-12 C-10,-8 -12,-2 -8,4 C-4,10 4,14 8,10 C12,6 14,0 14,-6Z" fill="#6B1414" />
        {/* Inner petals */}
        <path d="M0,-10 C5,-8 8,-4 7,1 C6,6 2,8 0,7 C-2,8 -6,6 -7,1 C-8,-4 -5,-8 0,-10Z" fill="#9A2222" />
        <path d="M-8,-2 C-5,-8 0,-10 4,-6 C8,-2 7,4 4,6 C1,8 -4,7 -6,4 C-8,1 -8,-2 -8,-2Z" fill="#A82828" />
        {/* Center bud */}
        <circle cx="0" cy="-1" r="3" fill="#B53030" />
        <circle cx="0" cy="-1" r="1.5" fill="#C44040" />
      </g>

      {/* -------- ROSE 2: upper-middle -------- */}
      <g transform="translate(140, 185) scale(1.15)" opacity="0.85">
        <path d="M0,-18 C9,-16 16,-9 14,0 C12,9 5,14 0,12 C-5,14 -12,9 -14,0 C-16,-9 -9,-16 0,-18Z" fill="#7A1818" />
        <path d="M-16,-7 C-12,-16 -3,-18 5,-14 C13,-10 15,-3 10,4 C5,12 -3,16 -8,12 C-13,8 -16,-1 -16,-7Z" fill="#8B1E1E" />
        <path d="M16,-7 C12,-16 3,-18 -5,-14 C-13,-10 -15,-3 -10,4 C-5,12 3,16 8,12 C13,8 16,-1 16,-7Z" fill="#6B1414" />
        <path d="M0,-11 C6,-9 9,-5 8,1 C7,7 3,9 0,8 C-3,9 -7,7 -8,1 C-9,-5 -6,-9 0,-11Z" fill="#9A2222" />
        <circle cx="0" cy="-1" r="3.5" fill="#B53030" />
        <circle cx="0" cy="-1" r="1.8" fill="#C44040" />
      </g>

      {/* -------- ROSE 3: middle-left -------- */}
      <g transform="translate(55, 295) scale(0.95)" opacity="0.8">
        <path d="M0,-16 C8,-14 14,-8 12,0 C10,8 4,12 0,10 C-4,12 -10,8 -12,0 C-14,-8 -8,-14 0,-16Z" fill="#7A1818" />
        <path d="M-14,-6 C-10,-14 -2,-16 4,-12 C10,-8 12,-2 8,4 C4,10 -4,14 -8,10 C-12,6 -14,0 -14,-6Z" fill="#8B1E1E" />
        <path d="M14,-6 C10,-14 2,-16 -4,-12 C-10,-8 -12,-2 -8,4 C-4,10 4,14 8,10 C12,6 14,0 14,-6Z" fill="#6B1414" />
        <path d="M0,-10 C5,-8 8,-4 7,1 C6,6 2,8 0,7 C-2,8 -6,6 -7,1 C-8,-4 -5,-8 0,-10Z" fill="#9A2222" />
        <circle cx="0" cy="-1" r="3" fill="#B53030" />
        <circle cx="0" cy="-1" r="1.5" fill="#C44040" />
      </g>

      {/* -------- ROSE 4: lower area -------- */}
      <g transform="translate(120, 420) scale(1.1)" opacity="0.85">
        <path d="M0,-17 C9,-15 15,-9 13,0 C11,9 5,13 0,11 C-5,13 -11,9 -13,0 C-15,-9 -9,-15 0,-17Z" fill="#7A1818" />
        <path d="M-15,-7 C-11,-15 -3,-17 5,-13 C12,-9 14,-3 9,4 C4,11 -3,15 -8,11 C-13,7 -15,-1 -15,-7Z" fill="#8B1E1E" />
        <path d="M15,-7 C11,-15 3,-17 -5,-13 C-12,-9 -14,-3 -9,4 C-4,11 3,15 8,11 C13,7 15,-1 15,-7Z" fill="#6B1414" />
        <path d="M0,-11 C6,-9 9,-5 8,1 C7,7 3,9 0,8 C-3,9 -7,7 -8,1 C-9,-5 -6,-9 0,-11Z" fill="#9A2222" />
        <circle cx="0" cy="-1" r="3.5" fill="#B53030" />
        <circle cx="0" cy="-1" r="1.8" fill="#C44040" />
      </g>

      {/* -------- ROSE 5: bottom -------- */}
      <g transform="translate(70, 530) scale(0.9)" opacity="0.75">
        <path d="M0,-15 C8,-13 13,-7 11,0 C9,8 4,11 0,9 C-4,11 -9,8 -11,0 C-13,-7 -8,-13 0,-15Z" fill="#7A1818" />
        <path d="M-13,-5 C-9,-13 -2,-15 4,-11 C10,-7 11,-1 7,4 C3,9 -3,13 -7,9 C-11,5 -13,0 -13,-5Z" fill="#8B1E1E" />
        <path d="M0,-9 C5,-7 7,-4 6,1 C5,5 2,7 0,6 C-2,7 -5,5 -6,1 C-7,-4 -5,-7 0,-9Z" fill="#9A2222" />
        <circle cx="0" cy="0" r="2.5" fill="#B53030" />
      </g>

      {/* -------- Leaves throughout -------- */}
      {/* Leaf cluster 1 */}
      <path d="M60,55 C50,45 40,50 45,60 C50,70 60,65 60,55Z" fill="#3D0B0B" opacity="0.55" />
      <path d="M55,57 L47,53" stroke="#5A1010" strokeWidth="0.5" opacity="0.4" />
      {/* Leaf cluster 2 */}
      <path d="M150,145 C145,135 135,138 138,148 C141,158 152,155 150,145Z" fill="#3D0B0B" opacity="0.5" />
      <path d="M120,155 C110,148 102,152 107,162 C112,172 122,165 120,155Z" fill="#3D0B0B" opacity="0.45" />
      {/* Leaf cluster 3 */}
      <path d="M45,240 C35,232 28,236 33,246 C38,256 48,250 45,240Z" fill="#3D0B0B" opacity="0.5" />
      <path d="M80,260 C72,252 65,256 70,266 C75,276 85,270 80,260Z" fill="#3D0B0B" opacity="0.45" />
      {/* Leaf cluster 4 */}
      <path d="M100,370 C92,360 84,364 88,374 C92,384 104,380 100,370Z" fill="#3D0B0B" opacity="0.5" />
      <path d="M60,390 C52,382 45,386 49,396 C53,406 64,400 60,390Z" fill="#3D0B0B" opacity="0.45" />
      {/* Leaf cluster 5 */}
      <path d="M135,480 C128,472 120,476 124,486 C128,496 138,490 135,480Z" fill="#3D0B0B" opacity="0.5" />
      <path d="M85,500 C78,492 70,496 74,506 C78,516 88,510 85,500Z" fill="#3D0B0B" opacity="0.45" />

      {/* Small rosebud accents */}
      <g transform="translate(40, 165) scale(0.5)" opacity="0.6">
        <circle cx="0" cy="0" r="6" fill="#6B1414" />
        <circle cx="0" cy="0" r="3.5" fill="#8B1E1E" />
        <circle cx="0" cy="0" r="1.5" fill="#A82828" />
      </g>
      <g transform="translate(105, 320) scale(0.55)" opacity="0.55">
        <circle cx="0" cy="0" r="6" fill="#6B1414" />
        <circle cx="0" cy="0" r="3.5" fill="#8B1E1E" />
        <circle cx="0" cy="0" r="1.5" fill="#A82828" />
      </g>
      <g transform="translate(45, 460) scale(0.45)" opacity="0.5">
        <circle cx="0" cy="0" r="6" fill="#6B1414" />
        <circle cx="0" cy="0" r="3.5" fill="#8B1E1E" />
        <circle cx="0" cy="0" r="1.5" fill="#A82828" />
      </g>

      {/* Thorns on main stem */}
      <path d="M127,55 L120,48" stroke="#5A1010" strokeWidth="1" opacity="0.5" />
      <path d="M98,140 L105,133" stroke="#5A1010" strokeWidth="1" opacity="0.5" />
      <path d="M128,230 L121,223" stroke="#5A1010" strokeWidth="1" opacity="0.5" />
      <path d="M90,320 L97,313" stroke="#5A1010" strokeWidth="1" opacity="0.5" />
      <path d="M130,400 L123,393" stroke="#5A1010" strokeWidth="1" opacity="0.5" />
      <path d="M105,490 L112,483" stroke="#5A1010" strokeWidth="1" opacity="0.5" />

      {/* Curling tendrils */}
      <path d="M70,30 C62,25 58,30 62,38" stroke="#4A0E0E" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M145,170 C155,165 158,170 153,178" stroke="#4A0E0E" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M40,340 C32,335 28,340 32,348" stroke="#4A0E0E" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M135,450 C145,445 148,450 143,458" stroke="#4A0E0E" strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Corner ornaments — gold filigree                                   */
/* ------------------------------------------------------------------ */
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4,4 C4,24 12,36 40,44" stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M4,4 C20,4 32,12 44,40" stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M4,10 C8,20 14,28 36,38" stroke="#D4AF37" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M10,4 C14,14 22,24 38,36" stroke="#D4AF37" strokeWidth="0.5" fill="none" opacity="0.35" />
      <circle cx="6" cy="6" r="2" fill="#D4AF37" opacity="0.7" />
      <circle cx="4" cy="4" r="0.8" fill="#F5E6C8" opacity="0.9" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Wax Seal — detailed gold embossed look                            */
/* ------------------------------------------------------------------ */
function WaxSealSVG() {
  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Scalloped outer edge */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const x = 45 + Math.cos(angle) * 38
        const y = 45 + Math.sin(angle) * 38
        return <circle key={i} cx={x} cy={y} r="8" fill="#A07918" opacity="0.85" />
      })}
      {/* Solid base */}
      <circle cx="45" cy="45" r="34" fill="#B08A1A" />
      <circle cx="45" cy="45" r="34" fill="url(#seal-gradient)" />
      {/* Inner ring */}
      <circle cx="45" cy="45" r="28" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.8" />
      <circle cx="45" cy="45" r="25" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
      {/* Rose illustration center */}
      <g transform="translate(45, 40)">
        {/* Outer petals */}
        <path d="M0,-12 C6,-10 10,-5 8,1 C6,7 2,10 0,8 C-2,10 -6,7 -8,1 C-10,-5 -6,-10 0,-12Z" fill="none" stroke="#D4AF37" strokeWidth="1" />
        <path d="M-10,-3 C-7,-10 -1,-12 4,-9 C9,-6 10,0 7,5 C4,10 -2,12 -5,9 C-8,6 -10,1 -10,-3Z" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
        <path d="M10,-3 C7,-10 1,-12 -4,-9 C-9,-6 -10,0 -7,5 C-4,10 2,12 5,9 C8,6 10,1 10,-3Z" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
        {/* Inner petals */}
        <path d="M0,-7 C3,-6 5,-3 4,0 C3,3 1,5 0,4 C-1,5 -3,3 -4,0 C-5,-3 -3,-6 0,-7Z" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
        {/* Center dot */}
        <circle cx="0" cy="-1" r="2" fill="#D4AF37" />
        {/* Leaves */}
        <path d="M-9,6 C-14,2 -16,8 -12,11 C-8,14 -6,10 -9,6Z" fill="none" stroke="#D4AF37" strokeWidth="0.6" />
        <path d="M9,6 C14,2 16,8 12,11 C8,14 6,10 9,6Z" fill="none" stroke="#D4AF37" strokeWidth="0.6" />
      </g>
      {/* Text arcs */}
      <defs>
        <path id="seal-text-top" d="M 14 45 A 31 31 0 0 1 76 45" />
        <path id="seal-text-bottom" d="M 18 50 A 27 27 0 0 0 72 50" />
        <radialGradient id="seal-gradient" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
        </radialGradient>
      </defs>
      <text fill="#D4AF37" fontSize="6" fontFamily="'Playfair Display', Georgia, serif" fontWeight="600" textAnchor="middle" letterSpacing="2">
        <textPath href="#seal-text-top" startOffset="50%">{'NHẤT TÂM HOA'}</textPath>
      </text>
      <text fill="#D4AF37" fontSize="5" fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle" letterSpacing="1.5">
        <textPath href="#seal-text-bottom" startOffset="50%">{'TÌNH YÊU TRỌN ĐỜI'}</textPath>
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  QR Code — gold-themed                                              */
/* ------------------------------------------------------------------ */
function QRCodePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="70"
        height="70"
        viewBox="0 0 70 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="QR Code"
      >
        <rect x="0" y="0" width="70" height="70" fill="transparent" />
        {/* Three position markers */}
        <rect x="4" y="4" width="20" height="20" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <rect x="8" y="8" width="12" height="12" fill="#D4AF37" opacity="0.85" />
        <rect x="46" y="4" width="20" height="20" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <rect x="50" y="8" width="12" height="12" fill="#D4AF37" opacity="0.85" />
        <rect x="4" y="46" width="20" height="20" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <rect x="8" y="50" width="12" height="12" fill="#D4AF37" opacity="0.85" />
        {/* Data pattern */}
        {[
          [28, 4], [34, 4], [40, 8], [28, 10], [36, 14],
          [28, 28], [32, 32], [38, 28], [44, 30], [52, 28],
          [48, 34], [56, 32], [44, 38], [52, 38], [28, 38],
          [36, 44], [44, 48], [52, 44], [48, 52], [56, 56],
          [44, 56], [36, 52], [28, 48], [56, 44], [34, 58],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="4" height="4" fill="#D4AF37" opacity={0.5 + (i % 3) * 0.15} />
        ))}
      </svg>
      <span className="text-[7px] tracking-[0.2em] uppercase text-center leading-tight" style={{ color: '#B8960B' }}>
        {'Quét để truy cập'}<br />{'website và tải về'}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Divider line                                                       */
/* ------------------------------------------------------------------ */
function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 justify-center">
        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M4 0 L6 2 L8 0 L6 4 L8 8 L6 6 L4 8 L2 6 L0 8 L2 4 L0 0 L2 2Z" fill="#D4AF37" opacity="0.6" />
        </svg>
        <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(270deg, transparent, #D4AF37)' }} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Serial ID generator                                                */
/* ------------------------------------------------------------------ */
function generateSerialId() {
  const num = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0')
  return `NTH-${num}-2026`
}

/* ------------------------------------------------------------------ */
/*  Main Certificate Component                                         */
/* ------------------------------------------------------------------ */
interface CommitmentCertificateProps {
  buyerName: string
  recipientName: string
  animate?: boolean
}

export function CommitmentCertificate({
  buyerName,
  recipientName,
  animate = true,
}: CommitmentCertificateProps) {
  const [serialId] = useState(() => generateSerialId())
  const [visible, setVisible] = useState(!animate)

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [animate])

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className={`relative w-full max-w-[720px] mx-auto transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ aspectRatio: '4 / 3' }}
    >
      {/* Layer 1: Thick outer gold frame */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #D4AF37, #A07918, #D4AF37, #B8960B, #D4AF37)',
          padding: '4px',
        }}
      >
        {/* Gap between outer and inner border */}
        <div className="h-full w-full" style={{ background: '#0C0A07', padding: '8px' }}>
          {/* Layer 2: Inner gold double-line border */}
          <div
            className="h-full w-full"
            style={{
              border: '1.5px solid #D4AF37',
              padding: '3px',
            }}
          >
            <div
              className="h-full w-full relative overflow-hidden cert-glow"
              style={{
                border: '0.5px solid rgba(212,175,55,0.35)',
                background: 'linear-gradient(140deg, #0D0B08 0%, #100E0A 30%, #140808 70%, #1A0A0A 100%)',
              }}
            >
              {/* Rose vine decoration on the left */}
              <RoseVineDecoration />

              {/* Corner ornaments */}
              <CornerOrnament className="absolute top-1.5 left-1.5" />
              <CornerOrnament className="absolute top-1.5 right-1.5 -scale-x-100" />
              <CornerOrnament className="absolute bottom-1.5 left-1.5 -scale-y-100" />
              <CornerOrnament className="absolute bottom-1.5 right-1.5 -scale-x-100 -scale-y-100" />

              {/* Certificate content — pushed slightly right to balance the rose vines */}
              <div
                className={`relative z-10 flex flex-col items-center justify-center h-full px-6 py-6 md:px-12 md:py-8 ${
                  animate ? 'cert-animate-in' : ''
                }`}
                style={{ marginLeft: '10%' }}
              >
                {/* Pre-title */}
                <p
                  className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-display"
                  style={{ color: '#C5A55A' }}
                >
                  {'Tấm Chứng Thư'}
                </p>

                {/* Main title */}
                <h2
                  className="mt-2 md:mt-3 text-2xl md:text-3xl lg:text-[2.6rem] font-bold tracking-[0.08em] font-display leading-tight"
                  style={{ color: '#F5E6C8' }}
                >
                  {'CHỨNG THƯ NHẤT TÂM'}
                </h2>

                {/* Serial ID */}
                <p
                  className="mt-1.5 md:mt-2 text-[9px] md:text-[11px] tracking-[0.3em] font-display"
                  style={{ color: '#B8960B' }}
                >
                  {`Serial ID: ${serialId}`}
                </p>

                {/* Gold divider */}
                <GoldDivider className="mt-4 md:mt-6 w-40" />

                {/* Body text */}
                <div className="mt-4 md:mt-6 text-center space-y-1 md:space-y-2">
                  <p
                    className="text-[10px] md:text-xs tracking-[0.25em] uppercase font-display"
                    style={{ color: '#C5A55A' }}
                  >
                    {'Xác nhận rằng'}
                  </p>
                  <p
                    className="text-lg md:text-2xl lg:text-[1.7rem] italic font-display"
                    style={{ color: '#F5E6C8' }}
                  >
                    {buyerName || "Buyer's Name"}
                  </p>
                  <p
                    className="text-[9px] md:text-xs leading-relaxed max-w-sm font-display tracking-wide"
                    style={{ color: '#B8960B' }}
                  >
                    {'Đã dành trọn sự chân thành và đóa hoa duy nhất cho'}
                  </p>
                  <p
                    className="text-lg md:text-2xl lg:text-[1.7rem] italic font-display"
                    style={{ color: '#F5E6C8' }}
                  >
                    {recipientName || "Recipient's Name"}
                  </p>
                </div>

                {/* Tagline */}
                <p
                  className="mt-4 md:mt-5 text-base md:text-lg lg:text-xl font-bold tracking-[0.12em] font-display"
                  style={{ color: '#F5E6C8' }}
                >
                  {'MỘT ĐỜI, MỘT ĐÓA, MỘT NGƯỜI.'}
                </p>

                {/* Date */}
                <p
                  className="mt-1.5 md:mt-2 text-[8px] md:text-[10px] tracking-[0.25em] uppercase font-display"
                  style={{ color: '#B8960B' }}
                >
                  {`Ngày xác nhận: ${currentDate}`}
                </p>

                {/* Bottom section: seal + QR */}
                <div className="mt-4 md:mt-6 flex w-full items-end justify-between px-2 md:px-6">
                  <WaxSealSVG />
                  <QRCodePlaceholder />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
