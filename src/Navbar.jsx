import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Links carry a route plus an optional hash, so they resolve from anywhere on
// the site rather than assuming the homepage is the current document.
const NAV_LINKS = [
  { label: 'The Kit', to: '/', hash: '#the-kit' },
  { label: 'Process', to: '/', hash: '#process' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact', to: '/', hash: '#contact' },
]

// Which routes render on the dark espresso ground. Drives the wordmark colour,
// the hamburger bars and the mobile overlay — a route being "not the homepage"
// no longer implies a light background.
const DARK_ROUTES = ['/', '/pricing']

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isDarkSurface = DARK_ROUTES.includes(location.pathname)
  const darkText = !isDarkSurface

  // Dark routes open on a full-bleed hero, so the header floats until content
  // scrolls up behind it. Light routes have no such hero — the header sits over
  // a form and a photograph from the first pixel, so it keeps its ground.
  const groundVisible = !isDarkSurface || isScrolled

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToSampleKit = () => {
    setIsMobileMenuOpen(false)
    navigate('/sample-kit')
  }

  const goTo = (link) => {
    setIsMobileMenuOpen(false)
    if (!link.hash) {
      navigate(link.to)
      return
    }
    if (location.pathname === link.to) {
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`${link.to}${link.hash}`)
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center gap-3 transition-colors duration-300 ${
          groundVisible && !isMobileMenuOpen
            ? `backdrop-blur-md ${isDarkSurface ? 'bg-[#1C1015]/85' : 'bg-white/85'}`
            : 'bg-transparent'
        }`}
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            setIsMobileMenuOpen(false)
            navigate('/')
          }}
          className="flex flex-row items-center gap-3 cursor-pointer"
        >
          <span
            className={`font-serif text-[24px] sm:text-[30px] font-bold tracking-tight select-none transition-colors duration-300 ${
              darkText ? 'text-[#1C1015]' : 'text-white'
            }`}
          >
            FASH
          </span>
          {/* Kept visible below sm — most traffic arrives on mobile, and this
              badge is the whole value proposition. */}
          <span className="text-[11px] font-sans font-semibold tracking-wide text-white bg-[#6E2A3E] rounded-full px-2 py-0.5 -translate-y-1">
            72h
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => {
            const active = !link.hash && location.pathname === link.to
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => goTo(link)}
                aria-current={active ? 'page' : undefined}
                className={`font-sans text-[15px] uppercase tracking-wide transition-colors cursor-pointer ${
                  darkText
                    ? 'text-[#1C1015]/70 hover:text-[#1C1015]'
                    : 'text-white/80 hover:text-white'
                } ${
                  active
                    ? 'text-white border-b border-[#D9A9B5] pb-1.5 -mb-1.5'
                    : ''
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={goToSampleKit}
          className={`hidden md:inline text-[18px] lg:text-[15px] 2xl:text-[17px] font-sans font-semibold underline underline-offset-2 hover:opacity-60 transition-opacity whitespace-nowrap cursor-pointer ${
            darkText ? 'text-[#6E2A3E]' : 'text-[#D9A9B5]'
          }`}
        >
          Get a free sample kit
        </button>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 -mr-2 z-[11]"
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
      </header>

      {/* Overlay ground follows the route, so leaving a dark page doesn't
          flash white. */}
      <div
        className={`fixed inset-0 z-[9] backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isDarkSurface ? 'bg-[#1C1015]/97' : 'bg-white/95'
        } ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <nav className="h-full flex flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => goTo(link)}
              className={`font-serif text-3xl font-semibold hover:opacity-60 transition-opacity cursor-pointer ${
                isDarkSurface ? 'text-white' : 'text-[#1C1015]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={goToSampleKit}
            className={`mt-4 text-lg font-sans font-semibold underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer ${
              isDarkSurface ? 'text-[#D9A9B5]' : 'text-[#6E2A3E]'
            }`}
          >
            Get a free sample kit
          </button>
        </nav>
      </div>
    </>
  )
}
