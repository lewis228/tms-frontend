import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Users,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Contact info cards ─── */
const CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "support@omniq.com",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Logistics Avenue, Suite 400, Logistics City, ST, 56789",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Monday – Friday, 9:00 AM – 6:00 PM",
  },
];

/* ─── FAQ items ─── */
const FAQ_ITEMS = [
  {
    question:
      "How long does it take for someone to respond to my inquiry?",
    answer:
      "We typically respond within 24 hours on business days. For urgent inquiries, please call our direct line for immediate assistance.",
  },
  {
    question: "Can I visit your office without an appointment?",
    answer:
      "We welcome walk-in visitors during business hours, but we recommend scheduling an appointment to ensure the right team member is available to assist you.",
  },
  {
    question:
      "What information should I include in my message for a quote?",
    answer:
      "Please include your shipping needs, the type of freight, and any specific services you require. This will help us provide an accurate quote.",
  },
  {
    question: "How do I track my shipment?",
    answer:
      "You can track your shipment through our online portal using your tracking number. Contact our support team if you need assistance accessing your tracking information.",
  },
];

/* ─── Subject options ─── */
const SUBJECTS = [
  "General Inquiry",
  "Request a Quote",
  "Warehousing Services",
  "Distribution Services",
  "Customs Brokerage",
  "Partnership Opportunities",
  "Technical Support",
  "Other",
];

/* ─── Main page ─── */
export default function ContactPage() {
  return (
    <>
      <HeroSection />
      <ContactInfoSection />
      <MapSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

/* ─── 1. Hero ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/4481256/pexels-photo-4481256.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop"
          alt="Warehouse workers discussing logistics — Tiger Lily on Pexels"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-landing-navy/65" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-32 text-center md:pb-20 md:pt-40 lg:px-8">
        <FadeIn>
          <h1 className="font-heading text-4xl font-bold italic text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Get in Touch with OMNIQ
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            We're here to support your logistics needs. Reach out to us for
            inquiries, quotes, or assistance.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-landing-navy/60 px-5 py-2 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Powering Businesses Globally
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 2. Contact Info + Form ─── */
function ContactInfoSection() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up form submission
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — info */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  Contact Info
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
                <span className="italic text-landing-red">Connect</span> with Us
                Today and{" "}
                <span className="italic text-landing-red">We'll Help</span> Your
                Business
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="mt-4 text-sm leading-relaxed text-landing-muted md:text-base">
                Ready to take your logistics to the next level? Contact us today
                to discover how our tailored solutions and industry expertise can
                transform your supply chain.
              </p>
            </FadeIn>

            {/* Contact cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CONTACT_CARDS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <FadeIn key={card.label} delay={0.12 + 0.05 * i}>
                    <div className="rounded-2xl border border-landing-border p-5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-landing-navy" />
                        <span className="text-xs font-medium text-landing-red">
                          {card.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-landing-navy">
                        {card.value}
                      </p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-landing-border bg-white p-6 md:p-8">
              <p className="font-heading text-lg font-bold italic text-landing-muted md:text-xl">
                Please fill out the form below, and our team will get back to
                you promptly.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* First + Last name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-sm font-semibold text-landing-navy"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-landing-border px-4 py-2.5 text-sm text-landing-navy placeholder:text-landing-muted/50 outline-none transition-colors focus:border-landing-navy"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-sm font-semibold text-landing-navy"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-landing-border px-4 py-2.5 text-sm text-landing-navy placeholder:text-landing-muted/50 outline-none transition-colors focus:border-landing-navy"
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-semibold text-landing-navy"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-landing-border px-4 py-2.5 text-sm text-landing-navy placeholder:text-landing-muted/50 outline-none transition-colors focus:border-landing-navy"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-semibold text-landing-navy"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-landing-border px-4 py-2.5 text-sm text-landing-navy placeholder:text-landing-muted/50 outline-none transition-colors focus:border-landing-navy"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1.5 block text-sm font-semibold text-landing-navy"
                  >
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-landing-border bg-white px-4 py-2.5 pr-10 text-sm text-landing-navy outline-none transition-colors focus:border-landing-navy"
                    >
                      <option value="" disabled>
                        Select message subject
                      </option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-muted" />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-semibold text-landing-navy"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Enter your message here"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full resize-none rounded-lg border border-landing-border px-4 py-2.5 text-sm text-landing-navy placeholder:text-landing-muted/50 outline-none transition-colors focus:border-landing-navy"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-full bg-landing-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-landing-navy-light"
                >
                  Contact Us
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Map / Find Us ─── */
function MapSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-landing-navy">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Map image */}
          <FadeIn>
            <div className="relative h-80 md:h-full md:min-h-[400px]">
              {/* Static map placeholder */}
              <div className="h-full w-full bg-[#e8e4df]">
                <iframe
                  title="OMNIQ Office Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-118.26000%2C33.73000%2C-118.24000%2C33.75000&layer=mapnik&marker=33.74%2C-118.25"
                  className="h-full w-full border-0"
                  loading="lazy"
                  aria-label="Map showing OMNIQ warehouse location"
                />
              </div>
              {/* Map UI overlay */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-md">
                <Users className="h-3.5 w-3.5 text-landing-navy" />
                <span className="text-xs font-semibold text-landing-navy">
                  Map
                </span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-0 overflow-hidden rounded-full bg-white shadow-md">
                <Search className="mx-2 h-3.5 w-3.5 text-landing-muted" />
                <input
                  type="text"
                  placeholder="Search location"
                  className="w-28 bg-transparent py-1.5 pr-3 text-xs text-landing-navy placeholder:text-landing-muted/50 outline-none md:w-36"
                  aria-label="Search location"
                  readOnly
                />
              </div>
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md"
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4 text-landing-navy" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md"
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4 text-landing-navy" />
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Text */}
          <div className="flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16">
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Find Us
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h2 className="mt-4 font-heading text-2xl font-bold italic text-white md:text-3xl lg:text-4xl">
                Conveniently Located for Easy Access to All Major Logistics
                Routes
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <motion.div
                className="mt-6 inline-block"
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-landing-navy transition-shadow hover:shadow-lg"
                >
                  Find the Direction
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-navy text-white">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. FAQ ─── */
function FaqSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header — centered */}
        <div className="text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                Frequently Ask Question
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
              Common{" "}
              <span className="italic text-landing-red">Questions</span> About
              Our Services
            </h2>
          </FadeIn>
        </div>

        {/* Accordion */}
        <FadeIn delay={0.1}>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion defaultValue={[2]} className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={i}
                  className="border-b border-landing-border"
                >
                  <AccordionTrigger className="py-5 text-left font-heading text-base font-bold text-landing-navy hover:no-underline md:text-lg [&[data-state=open]>svg]:rotate-180">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-landing-muted">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 5. CTA Banner ─── */
function CtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-5 pb-16 md:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1554646/pexels-photo-1554646.jpeg?auto=compress&cs=tinysrgb&w=1920&h=500&fit=crop"
            alt="Container ship at port — Tom Fisk on Pexels"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-landing-navy/50" />
        </div>

        <div className="relative z-10 px-8 py-16 md:px-12 md:py-20 lg:px-16">
          <FadeIn>
            <h2 className="max-w-2xl font-heading text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Contact us to discuss how our services can support your business
              and streamline your logistics needs.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <motion.div
              className="mt-6 inline-block"
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-landing-navy transition-shadow hover:shadow-lg hover:shadow-white/20"
              >
                Contact Us
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-landing-navy text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
