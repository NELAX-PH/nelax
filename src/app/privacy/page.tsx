import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function PrivacyPage() {
  const lastUpdated = 'February 20, 2026';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last Updated: {lastUpdated}</p>

          <div className="prose prose-blue max-w-none space-y-8 text-foreground/80">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an
                account, including your name, shop name, phone number, and email address. We also
                store the product and sales data you input into the system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services,
                process your transactions, and send you technical notices and support messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft,
                misuse, and unauthorized access. Your data is encrypted and stored securely in our
                cloud database.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Sharing of Information</h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share
                information with service providers (like payment processors) only as necessary to
                provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Choices</h2>
              <p>
                You may access, update, or delete your account information at any time by logging
                into your account settings. If you wish to delete your entire shop history, please
                contact our support team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at
                support@nelax.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
