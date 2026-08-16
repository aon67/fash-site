import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import SampleKitPage from './SampleKitPage.jsx'

const DELIVERABLES = ['Campaign Stills', 'Body-Type Renders', 'Short Videos', 'Thai Captions']

const MODELS = [
  { src: '/images/models/petite.webp', label: 'Petite' },
  { src: '/images/models/slim.webp', label: 'Slim' },
  { src: '/images/models/curvy.webp', label: 'Curvy' },
  { src: '/images/models/tall.webp', label: 'Tall' },
]

const STATS = [
  { number: '1', label: 'campaign photo set' },
  { number: '4', label: 'body types' },
  { number: '3', label: 'IG/TikTok videos' },
  { number: '10', label: 'Thai captions + scripts' },
]

function useTypewriter(text, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let interval
    const timeout = setTimeout(() => {
      let i = 0
      interval = setInterval(() => {
        i += 1
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}

const videoSources = ['/videos/fash-hero-1.mp4', '/videos/fash-hero-2.mp4']

function MediaPanel() {
  const [activeVideo, setActiveVideo] = useState(0)
  const videoRefs = useRef([])
  const navigate = useNavigate()

  // The autoPlay attribute only acts at mount, so drive playback on each
  // switch: restart and play the active video, pause the other.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === activeVideo) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [activeVideo])

  const goToSampleKit = () => navigate('/sample-kit')

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Get your sample kit"
      onClick={goToSampleKit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToSampleKit()
        }
      }}
      className="relative h-full min-h-[400px] lg:min-h-screen overflow-hidden lg:order-2 cursor-pointer"
    >
      <div className="absolute inset-0 animate-gradient-drift" />
      {videoSources.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            videoRefs.current[i] = el
          }}
          autoPlay={i === activeVideo}
          muted
          playsInline
          preload="auto"
          src={src}
          onEnded={() => setActiveVideo((current) => (current + 1) % videoSources.length)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === activeVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <span className="font-sans text-white font-semibold text-lg">Get your sample kit →</span>
      </div>
    </div>
  )
}

function DeliverablePills() {
  const [deliverables, setDeliverables] = useState([])

  const toggle = (item) =>
    setDeliverables((current) =>
      current.includes(item) ? current.filter((d) => d !== item) : [...current, item],
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-white mb-2">
        What does your launch need?
      </h2>
      <p className="opacity-85 text-[#8A6F76] font-sans mb-8">
        Select everything you want in your kit
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {DELIVERABLES.map((item) => {
          const active = deliverables.includes(item)
          return (
            <motion.button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-sans font-medium transition-colors ${
                active
                  ? 'bg-[#6E2A3E] text-white shadow-md shadow-[#6E2A3E]/20 transform'
                  : 'bg-transparent text-white border border-white/25 hover:bg-white/10'
              }`}
            >
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex"
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
              {item}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {deliverables.length === 0 ? (
          <motion.p
            key={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="opacity-50 italic text-xs font-sans"
          >
            Select what your campaign needs above.
          </motion.p>
        ) : (
          <motion.div
            key={deliverables.length}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden bg-[#FAF6F4] border border-[#F1E4E7] rounded-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4">
              <p className="text-sm font-sans text-[#5A4A50]">
                Ready to build a kit with:{' '}
                <span className="font-semibold text-[#1C1015]">{deliverables.join(', ')}</span>
              </p>
              <a
                href="#the-kit"
                className="flex items-center gap-1.5 font-sans uppercase text-xs text-[#6E2A3E] font-semibold tracking-wide hover:opacity-60 transition-opacity"
              >
                Get My Sample Kit
                <ArrowRight size={14} strokeWidth={2.5} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function HeroContent() {
  const { displayed, done } = useTypewriter('your photos in.\na campaign out.')

  return (
    <div className="relative bg-[#1C1015] text-white flex flex-col justify-center px-8 lg:px-16 py-20 lg:order-1">
      <main id="fash-hero" className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-5xl md:text-6xl lg:text-[76px] font-bold tracking-tight text-white leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-[#6E2A3E] align-middle ml-[2px] animate-blink" />
            )}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-lg md:text-xl text-[#D9C4CA] leading-relaxed font-sans mb-14 max-w-2xl">
            Send the product photos you already have.
            <br />
            We return campaign stills, short-form video, and Thai captions — on all four body
            types — in 72 hours. No photoshoot, no reshoots.
          </p>
        </motion.div>

        <DeliverablePills />
      </main>
    </div>
  )
}

const showcaseGridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const showcaseCardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function ShowcaseSection() {
  return (
    <section id="the-kit" className="w-full bg-[#1C1015] py-20 px-6">
      <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#D9A9B5] mb-8 text-center">
        FASH delivers — real output, one garment, four bodies
      </p>

      <motion.div
        variants={showcaseGridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
      >
        {MODELS.map((model) => (
          <motion.div
            key={model.label}
            variants={showcaseCardVariants}
            className="rounded-xl overflow-hidden bg-[#2A1620] relative aspect-[2/3]"
          >
            <img
              src={model.src}
              alt={`${model.label} body type wearing the sample garment`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 py-3 text-center font-serif text-lg font-semibold text-white bg-gradient-to-t from-black/60 to-transparent">
              {model.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12 pt-8 border-t border-white/10">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="font-serif text-3xl font-bold text-white">{stat.number}</span>
            <span className="font-sans text-xs uppercase tracking-wide text-white/60">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />
      <section className="relative grid lg:grid-cols-2 min-h-screen">
        <MediaPanel />
        <HeroContent />
      </section>
      <ShowcaseSection />
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="relative bg-white text-[#1C1015] font-sans selection:bg-[#F3E9E3] selection:text-[#6E2A3E] antialiased overflow-x-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sample-kit" element={<SampleKitPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
