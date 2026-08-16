import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'The Kit', href: '#the-kit' },
  { label: 'Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  // Homepage: light text over the dark hero panel. Every other route sits on
  // a light background, so the header flips to dark text.
  const darkText = !isHomepage || isMobileMenuOpen

  const goToSampleKit = () => {
    setIsMobileMenuOpen(false)
    navigate('/sample-kit')
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center gap-3 bg-transparent">
        <a
          href={isHomepage ? '#fash-hero' : undefined}
          onClick={isHomepage ? undefined : () => navigate('/')}
          className="flex flex-row items-center gap-3 cursor-pointer"
        >
          <span
            className={`font-serif text-[24px] sm:text-[30px] font-bold tracking-tight select-none transition-colors duration-300 ${
              darkText ? 'text-[#1C1015]' : 'text-white'
            }`}
          >
            FASH
          </span>
          <span className="hidden sm:inline-block text-[11px] font-sans font-semibold tracking-wide text-white bg-[#6E2A3E] rounded-full px-2 py-0.5 -translate-y-1">
            72h
          </span>
        </a>

        {isHomepage && (
          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-[15px] uppercase tracking-wide transition-colors text-white/80 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {isHomepage && (
          <button
            type="button"
            onClick={goToSampleKit}
            className="hidden md:inline text-[18px] lg:text-[15px] 2xl:text-[17px] font-sans text-[#D9A9B5] font-semibold underline underline-offset-2 hover:opacity-60 transition-opacity whitespace-nowrap cursor-pointer"
          >
            Get a free sample kit
          </button>
        )}

        {isHomepage && (
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 -mr-2"
          >
            <span
              className={`w-6 h-[2px] transition-all duration-300 ${
                darkText ? 'bg-[#1C1015]' : 'bg-white'
              } ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
            />
            <span
              className={`w-6 h-[2px] transition-all duration-300 ${
                darkText ? 'bg-[#1C1015]' : 'bg-white'
              } ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`w-6 h-[2px] transition-all duration-300 ${
                darkText ? 'bg-[#1C1015]' : 'bg-white'
              } ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
            />
          </button>
        )}
      </header>

      {isHomepage && (
        <div
          className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <nav className="h-full flex flex-col items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-3xl font-semibold text-[#1C1015] hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={goToSampleKit}
              className="mt-4 text-lg font-sans font-semibold text-[#6E2A3E] underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
            >
              Get a free sample kit
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
