import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, ChevronDown, Minus, Plus, RefreshCw } from 'lucide-react'
import Navbar from './Navbar.jsx'
import {
  TIERS,
  UNITS,
  buildLineItems,
  buildTotal,
  formatTHB,
  matchTier,
  tierSaving,
} from './pricing.js'

const MODELS = [
  { src: '/images/models/petite.webp', label: 'Petite' },
  { src: '/images/models/slim.webp', label: 'Slim' },
  { src: '/images/models/curvy.webp', label: 'Curvy' },
  { src: '/images/models/tall.webp', label: 'Tall' },
]

const CASE_STUDY = {
  // Anchor client is still under wraps — render the pending state rather than
  // a placeholder name.
  client: null,
  category: 'Activewear',
  quote: 'We shot nothing. The campaign ran on Monday.',
  attribution: 'Founder',
  stats: [
    { number: '24', label: 'SKUs shipped' },
    { number: '72h', label: 'to first live ad' },
    { number: '0', label: 'photoshoots' },
  ],
}

const FAQS = [
  {
    q: 'Will it actually look AI-generated?',
    a: 'Our production standard is real skin texture and natural asymmetry — we reject the over-retouched plastic look outright, because it reads as fake to the same customers you are trying to sell to. You should not have to take our word for it: send us one product and we will run it through a free sample kit so you can judge the output on your own garment before you spend anything.',
  },
  {
    q: 'Is the 72 hours real, and when does the clock start?',
    a: 'The clock starts when two things are true: we have usable product photos and you have approved the brief. From that point it is 72 hours, counted in Bangkok business days. If we miss it, the remedy is stated in your order confirmation — a guarantee without a consequence is just marketing.',
  },
  {
    q: 'What if I do not like what comes back?',
    a: 'Every kit includes revision rounds on the delivered SKUs. A revision means the same product and the same garment reworked — different framing, lighting, pose or caption. Swapping in a different product is a new SKU, not a revision. Naming that line up front is how we avoid the argument later.',
  },
  {
    q: 'Who owns the images, and can I run them as paid ads?',
    a: 'You own the delivered output and you can run it in paid media — Meta, TikTok, Shopee, Lazada, print, in-store. There is no per-impression licence and no expiry. The body-type models are synthetic, so there is no talent release to renew and no model booking to re-clear.',
  },
  {
    q: 'Are my product photos good enough to send?',
    a: 'Almost certainly yes. Flat-lay or on-hanger both work, phone photos are fine, and we do not need a studio or a lightbox. What helps most is a few angles and even lighting. If what you send is not usable we will tell you before the clock starts — you will never be billed for a shoot you have to redo.',
  },
  {
    q: 'How does payment, VAT and the tax invoice work?',
    a: 'All prices are in Thai baht and exclude 7% VAT. We issue a full tax invoice (ใบกำกับภาษี) against every order, so your accountant can process it normally, and we handle the 3% withholding tax on services for company buyers. Payment is by bank transfer or PromptPay.',
  },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

/* ── Price: one component, three always-present spans. The suffix slot never
   collapses, so a card's height cannot change when a number changes. ──────── */
function Price({ amount, billing, size = 'lg' }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span
        className={`font-serif font-bold tabular-nums tracking-tight text-white ${
          size === 'lg' ? 'text-4xl min-w-[5.5ch]' : 'text-2xl'
        }`}
      >
        {formatTHB(amount)}
      </span>
      <span className="font-sans text-xs font-medium text-[#8A6F76]">THB</span>
      <span className="font-sans text-xs text-[#8A6F76]">
        {billing === 'monthly' ? '/month' : 'one-time'}
      </span>
    </div>
  )
}

function Stepper({ label, value, min, max, disabled, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex-1 font-sans text-sm transition-opacity ${
          disabled ? 'text-[#8A6F76] opacity-50' : 'text-[#D9C4CA]'
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-white/15 p-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <Minus size={15} strokeWidth={2.5} />
        </button>
        <output className="min-w-[2ch] text-center font-sans text-sm font-semibold tabular-nums text-white">
          {value}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function KitBuilder() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(['stills', 'renders', 'video', 'captions'])
  const [skus, setSkus] = useState(3)
  const [videos, setVideos] = useState(2)

  const hasVideo = selected.includes('video')
  const videoCount = hasVideo ? videos : 0
  const lines = buildLineItems(selected, skus, videoCount)
  const total = buildTotal(selected, skus, videoCount)
  const match = selected.length ? matchTier(selected, skus, videoCount) : null
  const delta = match ? total - match.price : 0

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((unitId) => unitId !== id) : [...current, id],
    )

  const startSampleKit = () =>
    navigate('/sample-kit', {
      state: {
        kit: lines.map((line) => `${line.unit.label} × ${line.quantity}`).join(', '),
      },
    })

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <div>
        <div className="mb-8 flex flex-wrap gap-3">
          {UNITS.map((unit) => {
            const active = selected.includes(unit.id)
            return (
              <motion.button
                key={unit.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(unit.id)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 rounded-full px-5 py-3 font-sans text-sm font-medium transition-colors sm:py-2.5 ${
                  active
                    ? 'bg-[#6E2A3E] text-white shadow-md shadow-[#6E2A3E]/20'
                    : 'border border-white/25 bg-transparent text-white hover:bg-white/10'
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
                {unit.label}
              </motion.button>
            )
          })}
        </div>

        <ul className="mb-8 border-t border-white/10">
          {UNITS.map((unit) => (
            <li
              key={unit.id}
              className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/10 py-4 transition-opacity ${
                selected.includes(unit.id) ? 'opacity-100' : 'opacity-45'
              }`}
            >
              <div>
                <span className="font-sans text-[15px] font-medium text-white">{unit.label}</span>
                {unit.note && (
                  <span className="ml-3 font-sans text-xs text-[#8A6F76]">{unit.note}</span>
                )}
              </div>
              <span className="font-sans text-[15px] tabular-nums text-[#D9C4CA]">
                {formatTHB(unit.price)}
                <span className="ml-1.5 text-xs text-[#8A6F76]">
                  THB / {unit.per === 'video' ? 'video' : 'SKU'}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          <Stepper
            label="How many SKUs (products)?"
            value={skus}
            min={1}
            max={12}
            onChange={setSkus}
          />
          <Stepper
            label="How many short videos?"
            value={videoCount}
            min={hasVideo ? 1 : 0}
            max={8}
            disabled={!hasVideo}
            onChange={setVideos}
          />
          <p className="font-sans text-xs leading-relaxed text-[#8A6F76]">
            Video quantity is set independently of SKU count — a 3-SKU campaign often needs only
            one or two videos.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-28">
        <AnimatePresence mode="wait">
          {selected.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/15 px-5 py-6"
            >
              <p className="font-sans text-sm italic text-[#8A6F76]">
                Select what your campaign needs.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="rounded-2xl border border-[#F1E4E7] bg-[#FAF6F4] px-5 py-5"
              aria-live="polite"
            >
              {lines.map((line) => (
                <div
                  key={line.unit.id}
                  className="flex justify-between gap-4 py-1.5 font-sans text-[13px] text-[#5A4A50]"
                >
                  <span>
                    {line.unit.label} × {line.quantity}{' '}
                    {line.unit.per === 'video'
                      ? line.quantity === 1
                        ? 'video'
                        : 'videos'
                      : line.quantity === 1
                        ? 'SKU'
                        : 'SKUs'}
                  </span>
                  <span className="tabular-nums font-medium text-[#1C1015]">
                    {formatTHB(line.subtotal)}
                  </span>
                </div>
              ))}

              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[#F1E4E7] pt-3">
                <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#5A4A50]">
                  À la carte
                </span>
                <span className="font-serif text-3xl font-bold tabular-nums tracking-tight text-[#1C1015]">
                  {formatTHB(total)}
                </span>
              </div>

              {/* A build bigger than every package is the most valuable lead on
                  the page — it must never fall through to silence. */}
              {!match && (
                <p className="mt-3 border-t border-dashed border-[#F1E4E7] pt-3 font-sans text-[13px] leading-relaxed text-[#6E2A3E]">
                  This is larger than our standard packages — we&rsquo;ll quote it directly.
                </p>
              )}

              {match && (
                <p className="mt-3 border-t border-dashed border-[#F1E4E7] pt-3 font-sans text-[13px] leading-relaxed text-[#6E2A3E]">
                  {delta > 0 && (
                    <>
                      <strong className="font-semibold">{match.name}</strong> covers this for{' '}
                      {formatTHB(match.price)}
                      {match.billing === 'monthly' ? ' / month' : ''} — save {formatTHB(delta)}.
                    </>
                  )}
                  {delta === 0 && (
                    <>
                      This is exactly our <strong className="font-semibold">{match.name}</strong>{' '}
                      package, at {formatTHB(match.price)}
                      {match.billing === 'monthly' ? ' / month' : ''}.
                    </>
                  )}
                  {delta < 0 && (
                    <>
                      Closest package is{' '}
                      <strong className="font-semibold">{match.name}</strong> at{' '}
                      {formatTHB(match.price)} — more than you need right now.
                    </>
                  )}
                </p>
              )}

              <button
                type="button"
                onClick={startSampleKit}
                className="mt-4 flex cursor-pointer items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-[#6E2A3E] transition-opacity hover:opacity-60"
              >
                Try it free on one product
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TierCard({ tier }) {
  const navigate = useNavigate()
  const saving = tierSaving(tier)
  const recurring = tier.billing === 'monthly'

  return (
    <div
      className={`relative flex flex-col gap-4 rounded-2xl border p-6 ${
        tier.recommended
          ? 'order-first border-[#6E2A3E] bg-[#2A1620] lg:order-none lg:-translate-y-2'
          : 'border-white/10'
      } ${recurring ? 'pl-7' : ''}`}
    >
      {/* Retainer cue #3: a rail that survives the columns stacking on mobile. */}
      {recurring && (
        <span className="absolute inset-y-5 left-0 w-[2px] rounded-full bg-[#D9A9B5]" />
      )}

      {tier.ribbon && (
        <span className="absolute -top-3 left-6 rounded-full bg-[#6E2A3E] px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
          {tier.ribbon}
        </span>
      )}

      <h3 className="font-serif text-2xl font-bold tracking-tight text-white">{tier.name}</h3>

      {/* Retainer cue #2: a bordered pill, formally distinct from flat text. */}
      {recurring ? (
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#D9A9B5]/40 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#D9A9B5]">
          <RefreshCw size={11} strokeWidth={2.5} />
          Recurring
        </span>
      ) : (
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#8A6F76]">
          One-time
        </span>
      )}

      <Price amount={tier.price} billing={tier.billing} />

      {/* Taste Test is priced at exact à la carte parity, so it shows nothing —
          "save 0" is worse than silence. */}
      {saving > 0 && (
        <span className="font-sans text-xs tabular-nums text-[#D9A9B5]">
          Save {formatTHB(saving)} vs à la carte{recurring ? ', every month' : ''}
        </span>
      )}

      <p className="font-sans text-sm leading-relaxed text-[#D9C4CA]">{tier.blurb}</p>

      {/* Excluded rows are dashed, never omitted — an omitted row makes the
          reader count, and each card has to stand alone once stacked. */}
      <ul className="flex flex-col gap-2 border-t border-white/10 pt-4">
        {UNITS.map((unit) => {
          const included = tier.includes.includes(unit.id)
          const quantity = unit.per === 'video' ? tier.videos : tier.skus
          const suffix = recurring ? '/mo' : ''
          return (
            <li
              key={unit.id}
              className={`flex gap-2.5 font-sans text-[13px] ${
                included ? 'text-[#D9C4CA]' : 'text-[#8A6F76]'
              }`}
            >
              <span className="mt-0.5 flex w-3.5 flex-none justify-center">
                {included ? (
                  <Check size={14} strokeWidth={3} className="text-[#D9A9B5]" />
                ) : (
                  <span aria-hidden="true">–</span>
                )}
              </span>
              <span>
                {unit.label}
                {included ? (
                  <>
                    {' — '}
                    <span className="tabular-nums">{quantity}</span>{' '}
                    {unit.per === 'video'
                      ? quantity === 1
                        ? 'video'
                        : 'videos'
                      : quantity === 1
                        ? 'SKU'
                        : 'SKUs'}
                    {suffix}
                  </>
                ) : (
                  ' — not included'
                )}
              </span>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => navigate('/sample-kit', { state: { tier: tier.name } })}
        className={`mt-auto cursor-pointer rounded-lg px-5 py-3 font-sans text-sm font-semibold transition-opacity hover:opacity-90 ${
          tier.recommended
            ? 'bg-[#6E2A3E] text-white'
            : 'border border-white/25 text-white hover:bg-white/10'
        }`}
      >
        {tier.cta}
      </button>

      {tier.terms && (
        <span className="font-sans text-[11px] text-[#8A6F76]">{tier.terms}</span>
      )}
    </div>
  )
}

function Faq() {
  // Desktop opens the first answer so the section reads as answers rather than
  // a wall of closed questions; mobile stays collapsed so the footer CTA is
  // still reachable.
  const [open, setOpen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches ? 0 : null,
  )

  return (
    <ul className="max-w-3xl border-t border-white/10">
      {FAQS.map((faq, index) => {
        const expanded = open === index
        return (
          <li key={faq.q} className="border-b border-white/10">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : index)}
              className="flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left"
            >
              <span className="font-serif text-lg font-semibold text-white sm:text-xl">
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2}
                className={`mt-1 flex-none text-[#D9A9B5] transition-transform duration-300 ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 font-sans text-[15px] leading-relaxed text-[#D9C4CA]">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}

export default function PricingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-[100svh] bg-[#1C1015]"
    >
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-14 pt-28 sm:px-8 lg:px-16 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="mb-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-[56px]">
            what a campaign
            <br />
            actually costs.
          </h1>
          <p className="font-sans text-lg leading-relaxed text-[#D9C4CA] md:text-xl">
            72 hours. Four body types. No photoshoot. Priced per SKU, or bundled into a kit.
          </p>
          <p className="mt-3 font-sans text-sm text-[#8A6F76]">
            All prices in Thai baht, excluding 7% VAT.
          </p>
        </motion.div>
      </section>

      {/* ── Proof bar: buys permission to keep scrolling ─────────────── */}
      <div className="border-y border-white/10 px-6 py-4 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex gap-1.5">
            {MODELS.map((model) => (
              <img
                key={model.label}
                src={model.src}
                alt=""
                loading="lazy"
                className="h-9 w-7 rounded object-cover object-top"
              />
            ))}
          </div>
          <p className="font-sans text-sm text-[#D9C4CA]">
            <span className="text-[#8A6F76]">Anchor client · activewear —</span> 24 SKUs shipped,
            first campaign live in 72 hours.
          </p>
        </div>
      </div>

      {/* ── À la carte + build your kit ──────────────────────────────── */}
      <motion.section {...fadeUp} className="px-6 py-16 sm:px-8 lg:px-16 lg:py-24">
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.15em] text-[#D9A9B5]">
          À la carte
        </p>
        <h2 className="mb-3 max-w-2xl font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          build your own kit.
        </h2>
        <p className="mb-10 max-w-xl font-sans text-[#D9C4CA]">
          Pick what your launch needs and set your quantities. We&rsquo;ll tell you if a package
          costs less.
        </p>
        <KitBuilder />
      </motion.section>

      {/* ── Packaged tiers ───────────────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        id="packages"
        className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16 lg:py-24"
      >
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.15em] text-[#D9A9B5]">
          Packages
        </p>
        <h2 className="mb-12 max-w-2xl font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          or start from a kit.
        </h2>
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </motion.section>

      {/* ── Case study: placed after the price, where doubt spikes ───── */}
      <motion.section
        {...fadeUp}
        className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-3">
            {MODELS.map((model) => (
              <div
                key={model.label}
                className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#2A1620]"
              >
                <img
                  src={model.src}
                  alt={`${model.label} body-type render from the anchor client campaign`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.15em] text-[#D9A9B5]">
              Anchor client
            </p>
            <blockquote className="font-serif text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
              &ldquo;{CASE_STUDY.quote}&rdquo;
            </blockquote>
            <p className="mt-4 font-sans text-sm text-[#8A6F76]">
              {CASE_STUDY.attribution} · {CASE_STUDY.category} brand
              {CASE_STUDY.client ? ` · ${CASE_STUDY.client}` : ', named once they approve it'}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-6">
              {CASE_STUDY.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-serif text-3xl font-bold text-white">{stat.number}</span>
                  <span className="font-sans text-xs uppercase tracking-wide text-white/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <motion.section
        {...fadeUp}
        className="border-t border-white/10 px-6 py-16 sm:px-8 lg:px-16 lg:py-24"
      >
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.15em] text-[#D9A9B5]">
          Questions
        </p>
        <h2 className="mb-10 max-w-2xl font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          the things buyers ask first.
        </h2>
        <Faq />
      </motion.section>

      {/* ── Footer CTA: the one centred block on the route ───────────── */}
      <motion.section
        {...fadeUp}
        className="border-t border-white/10 px-6 py-20 text-center sm:px-8 lg:py-24"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
            not sure which one?
            <br />
            start with a free sample kit.
          </h2>
          <p className="font-sans leading-relaxed text-[#D9C4CA]">
            Send us a few product photos. We&rsquo;ll show you what a full campaign looks like on
            your own product — no cost, no commitment.
          </p>
          <button
            type="button"
            onClick={() => navigate('/sample-kit')}
            className="w-full cursor-pointer rounded-lg bg-[#6E2A3E] px-8 py-3.5 font-sans font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            Get a free sample kit
          </button>
          <button
            type="button"
            onClick={() => navigate('/sample-kit')}
            className="cursor-pointer py-2 font-sans text-sm font-semibold text-[#D9A9B5] underline underline-offset-2 transition-opacity hover:opacity-60"
          >
            or send your product photos directly
          </button>
          <p className="font-sans text-xs text-[#8A6F76]">
            72 hours · four body types · prices exclude 7% VAT
          </p>
        </div>
      </motion.section>
    </motion.div>
  )
}
