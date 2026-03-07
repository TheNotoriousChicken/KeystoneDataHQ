export default function Privacy() {
    return (
        <div className="bg-brand-bg min-h-screen py-24 px-6">
            <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none text-brand-muted prose-headings:text-white prose-a:text-brand-primary hover:prose-a:text-brand-primary-hover">
                    <p className="lead text-lg mb-8">
                        Last updated: March 2, 2026
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">1. Information We Collect</h2>
                    <p className="mb-6">
                        We collect information you provide directly to us when you create an account, such as your name, email address, and company name. We also collect data from third-party APIs (Shopify, Meta Ads, Google Analytics, Klaviyo) when you explicitly authorize Keystone Data HQ to connect to those platforms. This includes specific API tokens and analytics data required to power your dashboard.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">2. How We Use Your Data</h2>
                    <p className="mb-6">
                        We use the information we collect to provide, maintain, and improve our Service. Your third-party analytics data is strictly isolated to your company tenant. We do not sell your data, nor do we share your performance metrics with other Keystone Data HQ customers or third parties.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">3. Data Security</h2>
                    <p className="mb-6">
                        The security of your data is our priority. We use industry-standard security measures, including HTTPS encryption and secure credential storage (OAuth tokens), to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">4. Third-Party Services</h2>
                    <p className="mb-6">
                        We use third-party services to facilitate our Service. Most notably, we use Paddle as our Merchant of Record and payment processor. When you upgrade your subscription, your payment details are handled securely by Paddle and are subject to their Privacy Policy. We do not store full credit card numbers on our servers.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">5. Cookies and Tracking</h2>
                    <p className="mb-6">
                        We use cookies and similar tracking technologies to track activity on our Service and hold certain information, primarily for authenticating your session and maintaining secure access to your dashboard.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">6. Your Rights</h2>
                    <p className="mb-6">
                        You have the right to access, update, or delete the personal information we have on you. If you wish to exercise these rights, or disconnect your third-party integrations and purge associated data, you can do so from your account settings or by contacting support.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">7. Contact Us</h2>
                    <p className="mb-6">
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@keystonedatahq.com">privacy@keystonedatahq.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
