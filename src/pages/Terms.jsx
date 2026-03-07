export default function Terms() {
    return (
        <div className="bg-brand-bg min-h-screen py-24 px-6">
            <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Terms of Service</h1>
                <div className="prose prose-invert max-w-none text-brand-muted prose-headings:text-white prose-a:text-brand-primary hover:prose-a:text-brand-primary-hover">
                    <p className="lead text-lg mb-8">
                        Last updated: March 2, 2026
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By accessing or using Keystone Data HQ ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">2. Description of Service</h2>
                    <p className="mb-6">
                        Keystone Data HQ is a B2B SaaS data analytics platform that connects to third-party APIs (such as Shopify, Meta Ads, Google Analytics, and Klaviyo) to aggregate, process, and display data via automated dashboards. We do not own the data pulled from these third-party platforms.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">3. User Responsibilities</h2>
                    <p className="mb-6">
                        You must provide accurate and complete registration information. You are responsible for the security of your account credentials and for all activities that occur under your account. You agree not to use the Service for any illegal or unauthorized purpose.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">4. Subscriptions and Payments</h2>
                    <p className="mb-6">
                        The Service is billed on a subscription basis. All payments are processed securely via our Merchant of Record, Paddle. By subscribing, you agree to our <a href="/refund">Refund Policy</a> and authorize us to charge your selected payment method.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">5. Intellectual Property</h2>
                    <p className="mb-6">
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Keystone Data HQ and its licensors. You may not reproduce, modify, or distribute our intellectual property without express written permission.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">6. Limitation of Liability</h2>
                    <p className="mb-6">
                        In no event shall Keystone Data HQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">7. Contact Us</h2>
                    <p className="mb-6">
                        If you have any questions about these Terms, please contact us at <a href="mailto:legal@keystonedatahq.com">legal@keystonedatahq.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
