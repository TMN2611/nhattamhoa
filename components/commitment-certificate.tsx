'use client'

import { useEffect, useState } from 'react'

function RoseVineSVG() {
  return (
    <svg
      className="absolute left-0 top-0 h-full w-[140px] pointer-events-none opacity-60"
      viewBox="0 0 140 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main vine stem */}
      <path
        className="vine-path"
        d="M70 0 C70 50, 30 80, 40 130 C50 180, 80 160, 70 220 C60 280, 20 300, 35 360 C50 420, 75 400, 65 460 C55 520, 30 540, 40 600"
        stroke="#8B1A1A"
        strokeWidth="2"
        fill="none"
      />
      {/* Branch curves */}
      <path
        className="vine-path"
        d="M40 130 C20 110, 10 120, 15 100"
        stroke="#8B1A1A"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        className="vine-path"
        d="M70 220 C90 200, 110 210, 105 190"
        stroke="#8B1A1A"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        className="vine-path"
        d="M35 360 C15 340, 5 350, 10 330"
        stroke="#8B1A1A"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        className="vine-path"
        d="M65 460 C85 440, 100 450, 95 430"
        stroke="#8B1A1A"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Rose blooms - stylized circles */}
      <circle cx="15" cy="100" r="12" fill="#6B0F0F" opacity="0.7" />
      <circle cx="15" cy="100" r="7" fill="#8B1A1A" opacity="0.8" />
      <circle cx="15" cy="100" r="3" fill="#A52525" opacity="0.9" />

      <circle cx="105" cy="190" r="14" fill="#6B0F0F" opacity="0.7" />
      <circle cx="105" cy="190" r="8" fill="#8B1A1A" opacity="0.8" />
      <circle cx="105" cy="190" r="4" fill="#A52525" opacity="0.9" />

      <circle cx="10" cy="330" r="11" fill="#6B0F0F" opacity="0.7" />
      <circle cx="10" cy="330" r="6" fill="#8B1A1A" opacity="0.8" />
      <circle cx="10" cy="330" r="3" fill="#A52525" opacity="0.9" />

      <circle cx="95" cy="430" r="13" fill="#6B0F0F" opacity="0.7" />
      <circle cx="95" cy="430" r="7.5" fill="#8B1A1A" opacity="0.8" />
      <circle cx="95" cy="430" r="3.5" fill="#A52525" opacity="0.9" />

      {/* Small leaves */}
      <ellipse cx="50" cy="160" rx="8" ry="4" transform="rotate(-30 50 160)" fill="#4A0E0E" opacity="0.5" />
      <ellipse cx="55" cy="260" rx="7" ry="3.5" transform="rotate(20 55 260)" fill="#4A0E0E" opacity="0.5" />
      <ellipse cx="45" cy="400" rx="8" ry="4" transform="rotate(-25 45 400)" fill="#4A0E0E" opacity="0.5" />
      <ellipse cx="60" cy="500" rx="7" ry="3.5" transform="rotate(15 60 500)" fill="#4A0E0E" opacity="0.5" />
    </svg>
  )
}

function WaxSealSVG() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer scalloped edge */}
      <path
        d="M40 2 L44 10 L52 4 L52 13 L61 9 L58 18 L67 17 L61 24 L70 27 L62 32 L70 38 L61 39 L67 46 L58 44 L61 53 L52 49 L52 58 L44 52 L40 60 L36 52 L28 58 L28 49 L19 53 L22 44 L13 46 L19 39 L10 38 L18 32 L10 27 L19 24 L13 17 L22 18 L19 9 L28 13 L28 4 L36 10 Z"
        fill="#B8860B"
        opacity="0.9"
      />
      {/* Inner circle */}
      <circle cx="40" cy="31" r="20" fill="#96720A" stroke="#D4AF37" strokeWidth="1" />
      {/* Rose symbol in center */}
      <circle cx="40" cy="28" r="6" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
      <circle cx="40" cy="28" r="3.5" fill="none" stroke="#D4AF37" strokeWidth="0.6" />
      <circle cx="40" cy="28" r="1.5" fill="#D4AF37" />
      {/* Petals */}
      <ellipse cx="34" cy="26" rx="3" ry="5" transform="rotate(30 34 26)" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
      <ellipse cx="46" cy="26" rx="3" ry="5" transform="rotate(-30 46 26)" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
      <ellipse cx="40" cy="22" rx="3" ry="5" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
      {/* Text arc */}
      <text
        fill="#D4AF37"
        fontSize="5"
        fontFamily="Georgia, serif"
        textAnchor="middle"
      >
        <textPath href="#seal-arc-top">
          {'NHẤT TÂM HOA'}
        </textPath>
      </text>
      <text
        fill="#D4AF37"
        fontSize="4.5"
        fontFamily="Georgia, serif"
        textAnchor="middle"
      >
        <textPath href="#seal-arc-bottom">
          {'TÌNH YÊU TRỌN ĐỜI'}
        </textPath>
      </text>
      {/* Text paths */}
      <defs>
        <path id="seal-arc-top" d="M 18 31 A 22 22 0 0 1 62 31" />
        <path id="seal-arc-bottom" d="M 20 35 A 20 20 0 0 0 60 35" />
      </defs>
    </svg>
  )
}

function QRCodePlaceholder() {
  return (
    <div className="qr-pulse flex flex-col items-center gap-1">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="QR Code"
      >
        {/* QR code pattern */}
        <rect x="0" y="0" width="64" height="64" fill="transparent" />
        {/* Position markers */}
        <rect x="4" y="4" width="18" height="18" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <rect x="8" y="8" width="10" height="10" fill="#D4AF37" />
        <rect x="42" y="4" width="18" height="18" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <rect x="46" y="8" width="10" height="10" fill="#D4AF37" />
        <rect x="4" y="42" width="18" height="18" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <rect x="8" y="46" width="10" height="10" fill="#D4AF37" />
        {/* Data pixels */}
        <rect x="26" y="4" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="34" y="4" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="26" y="12" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="30" y="8" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="26" y="26" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="30" y="30" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="34" y="26" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="42" y="26" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="50" y="26" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="46" y="30" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="54" y="30" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="42" y="34" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="50" y="34" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="26" y="34" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="34" y="42" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="42" y="46" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="50" y="42" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="46" y="50" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="54" y="54" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="42" y="54" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="34" y="50" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="26" y="46" width="4" height="4" fill="#D4AF37" opacity="0.6" />
        <rect x="54" y="42" width="4" height="4" fill="#D4AF37" opacity="0.6" />
      </svg>
      <span className="text-[8px] tracking-[0.15em] uppercase">
        {'Quét để truy cập'}
      </span>
    </div>
  )
}

function generateSerialId() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `NTH-${num}`
}

interface CommitmentCertificateProps {
  buyerName: string
  recipientName: string
  blockchainData?: { orderId: string, txHash: string } | null
  animate?: boolean
}

export function CommitmentCertificate({
  buyerName,
  recipientName,
  blockchainData,
  animate = true,
}: CommitmentCertificateProps) {
  const [serialId] = useState(() => blockchainData?.orderId || generateSerialId())
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
      className={`relative w-full max-w-2xl mx-auto transition-all duration-1000 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {/* Outer gold border */}
      <div className="p-[3px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#D4AF37]">
        {/* Inner gold border with gap */}
        <div className="p-[6px]" style={{ background: '#0a0a08' }}>
          <div className="p-[2px] bg-gradient-to-br from-[#D4AF37]/60 via-[#B8860B]/40 to-[#D4AF37]/60">
            {/* Main certificate body */}
            <div
              className="relative overflow-hidden cert-glow"
              style={{
                background: 'linear-gradient(135deg, #0d0b09 0%, #12100d 40%, #1a0505 100%)',
              }}
            >
              {/* Rose vine decoration */}
              <RoseVineSVG />

              {/* Certificate content */}
              <div
                className={`relative z-10 flex flex-col items-center px-8 py-10 md:px-16 md:py-14 ${
                  animate ? 'cert-animate-in' : ''
                }`}
              >
                {/* Pre-title */}
                <p
                  className="text-xs tracking-[0.35em] uppercase font-display"
                 
                >
                  {'Tấm Chứng Thư'}
                </p>

                {/* Main title */}
                <h2
                  className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider font-display"
                 
                >
                  {'CHỨNG THƯ NHẤT TÂM'}
                </h2>

                {/* Serial */}
                <p
                  className="mt-3 text-xs tracking-[0.3em] font-display"
                 
                >
                  {`Serial ID: ${serialId}`}
                </p>

                {/* Divider */}
                <div
                  className="mt-8 h-px w-32"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                />

                {/* Body text */}
                <div className="mt-8 text-center space-y-3">
                  <p
                    className="text-sm tracking-[0.2em] uppercase font-display"
                   
                  >
                    {'Xác nhận rằng'}
                  </p>
                  <p
                    className="text-2xl md:text-3xl italic font-display"
                   
                  >
                    {buyerName}
                  </p>
                  <p
                    className="text-sm md:text-base leading-relaxed max-w-md font-display"
                   
                  >
                    {'Đã dành trọn sự chân thành và đóa hoa duy nhất cho'}
                  </p>
                  <p
                    className="text-2xl md:text-3xl italic font-display"
                   
                  >
                    {recipientName}
                  </p>
                </div>

                {/* Tagline */}
                <div className="mt-8">
                  <p
                    className="text-lg md:text-xl font-bold tracking-[0.15em] font-display"
                   
                  >
                    {'MỘT ĐỜI, MỘT ĐÓA, MỘT NGƯỜI.'}
                  </p>
                </div>

                {/* Date */}
                <p
                  className="mt-4 text-xs tracking-[0.2em] uppercase font-display"
                 
                >
                  {`Ngày xác nhận: ${currentDate}`}
                </p>

                {blockchainData && (
                  <div className="mt-6 p-4 border border-gold/20 bg-black/40 text-left w-full max-w-sm rounded-sm backdrop-blur-sm">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-display">
                      Chứng thực Blockchain (Polygon)
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] text-muted-foreground">Certificate ID:</span>
                        <span className="text-[10px] text-foreground font-mono truncate">{blockchainData.orderId}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] text-muted-foreground">TX Hash:</span>
                        <span className="text-[10px] text-gold font-mono truncate hover:underline cursor-pointer">
                          {blockchainData.txHash.substring(0, 10)}...{blockchainData.txHash.substring(60)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-green-500 uppercase tracking-widest">Recorded permanently</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom section: seal + QR */}
                <div className="mt-10 flex w-full items-end justify-between px-2">
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
