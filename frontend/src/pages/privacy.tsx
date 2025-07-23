import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50 text-gray-800">
      <Navbar />

      <main className="flex-grow w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 ">
          <h1 className="text-4xl font-extrabold mb-6 text-center text-red-600">Privacy Policy</h1>

          <p className="mb-6 text-lg leading-relaxed text-gray-700">
            At <strong className="text-black">Convertio.info</strong>, your privacy is important to us.
            This privacy policy explains what data we collect and how we use it.
          </p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">1. Information We Collect</h2>
            <p className="text-base leading-relaxed">
              We only collect data necessary for file conversions, and we do not store your files after the conversion is complete.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">2. Google User Data</h2>
            <p className="text-base leading-relaxed">
              If you connect Google Drive, we only request access to the files you choose. We do not access, store, or share your Google account info.
              All access tokens are short-lived and used only for file retrieval.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">3. Cookies</h2>
            <p className="text-base leading-relaxed">
              We may use cookies for functionality and analytics. You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">4. Contact</h2>
            <p className="text-base leading-relaxed">
              For questions regarding privacy, email us at:{" "}
              <a
                href="mailto:convertio.info.help@gmail.com"
                className="text-red-600 hover:underline"
              >
                convertio.info.help@gmail.com
              </a>
            </p>
          </section>

          <p className="mt-8 text-sm text-gray-500 text-right">Last updated: July 23, 2025</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
