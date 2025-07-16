import { Mail } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 bg-white text-gray-800">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Contact</h1>
        <p className="text-xl text-gray-600">We'd love to hear from you</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <div>
          <p className="text-lg leading-relaxed mb-6">
            At <strong>Convertio.info / JahaSoft (Pvt) Ltd</strong>, your voice matters. Whether you have feedback,
            questions, or concerns, we're always here to listen and assist. Our goal is to make your experience with
            us as smooth and enjoyable as possible.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">How to Reach Us</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            If you need help, have a suggestion, or simply want to share your thoughts, don't hesitate to contact us.
            You can reach out by sending an email to our dedicated support team.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-600 mr-3" />
              <a 
                href="mailto:info@jahasoft.pk" 
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                info@jahasoft.pk
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Why Your Feedback Matters</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Improve our services to better meet your needs</li>
            <li>• Address any concerns promptly and effectively</li>
            <li>• Innovate and grow with your ideas and suggestions</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Thank You for Trusting Us</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We're grateful for your support and trust in <strong>Convertio.info / JahaSoft (Pvt) Ltd</strong>.
            Your loyalty inspires us to strive for excellence and continue delivering top-notch solutions
            tailored to your needs.
          </p>
          <p className="text-gray-700 font-medium">
            We look forward to hearing from you and are excited to keep serving you with the best possible experience.
          </p>
        </div>

        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-1">Warm regards,</p>
          <p className="text-gray-600 font-medium">The Convertio.info Team</p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;