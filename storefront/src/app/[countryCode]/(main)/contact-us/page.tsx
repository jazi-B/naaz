import { Metadata } from 'next'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'Customer Support | NAAZ Women’s Handbags Pakistan',
  description: 'Need help with your luxury handbag order, delivery tracking or returns? Contact NAAZ 24/7 on WhatsApp or Phone.',
}

export default function ContactUsPage() {
  return (
    <Container className="min-h-screen max-w-full bg-secondary !p-0">
      <Container className="!py-10 max-w-[1100px] mx-auto px-4">
        <StoreBreadcrumbs breadcrumb="Customer Support & Contact" />

        <div className="mt-6 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
            Always Here To Assist You
          </span>
          <Heading as="h1" className="text-3xl medium:text-5xl font-bold tracking-tight text-static">
            NAAZ Customer Support (ناز)
          </Heading>
          <Text className="mt-3 text-secondary text-sm medium:text-base">
            Have questions about product details, courier delivery, exchange or returns? Reach out to our dedicated support team across Pakistan.
          </Text>
        </div>

        {/* Contact Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Support */}
          <div className="bg-primary p-8 rounded-2xl border border-basic-primary shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4">
                💬
              </div>
              <h3 className="text-xl font-bold text-static">WhatsApp Helpline</h3>
              <p className="mt-2 text-sm text-secondary">
                Instant order placement, tracking updates & unboxing video support via WhatsApp.
              </p>
              <p className="mt-4 font-mono font-bold text-emerald-400 text-lg">+92 304 7437611</p>
            </div>
            <a
              href="https://wa.me/923047437611?text=Hi%20NAAZ%20Support,%20I%20have%20an%20inquiry%20about%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-center text-sm shadow-md transition-all duration-200 block"
            >
              Chat on WhatsApp ↗
            </a>
          </div>

          {/* Nationwide Delivery Times */}
          <div className="bg-primary p-8 rounded-2xl border border-basic-primary shadow-lg flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mb-4">
                🚚
              </div>
              <h3 className="text-xl font-bold text-static">Delivery Timelines</h3>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                <li className="flex justify-between">
                  <span>Major Cities (LHE, KHI, ISB, FSD):</span>
                  <strong className="text-static">2-3 Days</strong>
                </li>
                <li className="flex justify-between">
                  <span>Other Cities & Towns:</span>
                  <strong className="text-static">3-4 Days</strong>
                </li>
                <li className="flex justify-between">
                  <span>Courier Partners:</span>
                  <strong className="text-amber-500">TCS, Leopards, Trax</strong>
                </li>
              </ul>
            </div>
            <a
              href="/pk/track-order"
              className="mt-6 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-center text-sm shadow-md transition-all duration-200 block"
            >
              Track Your Order ↗
            </a>
          </div>

          {/* Email & Returns */}
          <div className="bg-primary p-8 rounded-2xl border border-basic-primary shadow-lg flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-static">7-Day Easy Returns</h3>
              <p className="mt-2 text-sm text-secondary">
                Received a damaged or wrong bag? Enjoy 100% money-back or free courier replacement within 7 days.
              </p>
              <p className="mt-4 text-xs text-secondary">
                Email: <strong className="text-static">support@naaz.pk</strong>
              </p>
            </div>
            <a
              href="/pk/faq"
              className="mt-6 w-full py-3 rounded-xl bg-basic-primary hover:bg-basic-primary-hover text-static font-semibold text-center text-sm border border-basic-primary transition-all duration-200 block"
            >
              Read Return Policy ↗
            </a>
          </div>
        </div>

        {/* FAQ Quick CTA */}
        <div className="mt-12 bg-primary p-8 rounded-2xl border border-basic-primary text-center">
          <h3 className="text-xl font-bold text-static">Frequently Asked Questions</h3>
          <p className="mt-2 text-sm text-secondary max-w-xl mx-auto">
            Got questions about Cash on Delivery verification, delivery charges, or handbag material?
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <a
              href="/pk/faq"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all duration-200"
            >
              Browse All FAQs
            </a>
            <a
              href="/pk/shop"
              className="px-6 py-2.5 rounded-xl bg-secondary border border-basic-primary text-static text-sm font-semibold hover:bg-primary transition-all duration-200"
            >
              Explore Bag Catalog
            </a>
          </div>
        </div>
      </Container>
    </Container>
  )
}
