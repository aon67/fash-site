import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import Navbar from './Navbar.jsx'

const inputClasses =
  'w-full border border-[#F1E4E7] rounded-lg px-4 py-3 font-sans text-[#1C1015] bg-white focus:outline-none focus:border-[#6E2A3E] transition-colors'

const labelClasses = 'block font-sans text-sm font-semibold text-[#1C1015] mb-2'

const formVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export default function SampleKitPage() {
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // After submission, show the confirmation for 2.5s then return home.
  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => navigate('/'), 2500)
    return () => clearTimeout(timer)
  }, [submitted, navigate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />

      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="bg-[#FAF6F4] flex flex-col justify-center px-8 lg:px-16 py-20">
          <main className="w-full max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1C1015] mb-4">
              Get your free sample kit
            </h1>
            <p className="font-sans text-lg text-[#5A4A50] mb-12">
              Send us a few product photos and we&rsquo;ll show you what a full campaign looks
              like — no cost, no commitment.
            </p>

            <motion.form
              variants={formVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <motion.div variants={fieldVariants} className="mb-6">
                <label htmlFor="brand-name" className={labelClasses}>
                  Brand name
                </label>
                <input id="brand-name" name="brandName" type="text" className={inputClasses} />
              </motion.div>

              <motion.div variants={fieldVariants} className="mb-6">
                <label htmlFor="instagram-handle" className={labelClasses}>
                  Instagram handle
                </label>
                <input
                  id="instagram-handle"
                  name="instagramHandle"
                  type="text"
                  className={inputClasses}
                />
              </motion.div>

              <motion.div variants={fieldVariants} className="mb-6">
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input id="email" name="email" type="email" className={inputClasses} />
              </motion.div>

              <motion.div variants={fieldVariants} className="mb-6">
                <label htmlFor="launching" className={labelClasses}>
                  What are you launching?
                </label>
                <textarea id="launching" name="launching" rows={3} className={inputClasses} />
              </motion.div>

              <motion.div variants={fieldVariants}>
                <button
                  type="submit"
                  className="bg-[#6E2A3E] text-white font-sans font-semibold rounded-lg px-8 py-3 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Send my sample kit request
                </button>
              </motion.div>
            </motion.form>

            {submitted && (
              <>
                <div className="bg-white border border-[#F1E4E7] rounded-lg p-4 text-[#1C1015] mt-6 font-sans">
                  Thanks — we&rsquo;ll be in touch within 24 hours.
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="font-sans text-sm text-[#6E2A3E] underline underline-offset-2 mt-3 cursor-pointer"
                >
                  ← Back to homepage
                </button>
              </>
            )}
          </main>
        </div>

        <div className="relative h-full min-h-[400px] lg:min-h-screen overflow-hidden hidden lg:block">
          <img
            src="/images/models/slim.webp"
            alt="Campaign still of the slim body-type model"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1015] via-[#1C1015]/20 to-transparent" />
        </div>
      </div>
    </motion.div>
  )
}
