import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function TermsPage() {
  const lastUpdated = 'February 20, 2026';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-12">Last Updated: {lastUpdated}</p>

          <div className="prose prose-blue max-w-none space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using Nelax Systems, you agree to be bound by these Terms of
                Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p>
                Nelax Systems provides a web-based Point of Sale (POS) and inventory management
                system designed for micro-retail businesses in the Philippines. We reserve the right
                to modify or discontinue any part of the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Subscription and Fees</h2>
              <p>Nelax Systems offers two tiers of service:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  <strong>Sari-Sari Lite:</strong> A free-of-charge tier with limited features and
                  storage.
                </li>
                <li>
                  <strong>Sari-Sari Pro:</strong> A paid subscription at the rate of ₱149 per month,
                  which includes full access to all features.
                </li>
              </ul>
              <p className="mt-4">
                Paid subscriptions are billed in advance and are non-refundable once the 7-day free
                trial period has ended.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and
                password. You agree to provide accurate business information and comply with all
                local laws and regulations regarding your retail operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Ownership</h2>
              <p>
                You own all data, information, or material that you submit to the service. However,
                you grant Nelax Systems a license to host and backup this data to ensure the
                continuity of your service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                Nelax Systems shall not be liable for any indirect, incidental, special, or
                consequential damages resulting from the use or the inability to use the service.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
