export default function Refund() {
    return (
        <div className="bg-brand-bg min-h-screen py-24 px-6">
            <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12">
                <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Refund Policy</h1>
                <div className="prose prose-invert max-w-none text-brand-muted prose-headings:text-white prose-a:text-brand-primary hover:prose-a:text-brand-primary-hover">
                    <p className="lead text-lg mb-8">
                        Last updated: March 2, 2026
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">7-Day Money-Back Guarantee</h2>
                    <p className="mb-6">
                        Keystone Data HQ offers a strict 7-day money-back guarantee for all new subscriptions.
                    </p>
                    <p className="mb-6">
                        If you are not entirely satisfied with your Keystone Data HQ dashboard, integrations, or reports within your first 7 days of signing up for a paid plan, contact our support team at <a href="mailto:support@keystonedatahq.com">support@keystonedatahq.com</a> for a full, no-questions-asked refund.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">Cancellations</h2>
                    <p className="mb-6">
                        After the initial 7-day period, you may cancel your subscription at any time. When you cancel, your account will remain active until the end of your current billing cycle (monthly or annual).
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">Non-Refundable Charges</h2>
                    <p className="mb-6">
                        Except as noted in the 7-day money-back guarantee, all charges are non-refundable. We do not provide prorated refunds for mid-billing cycle cancellations or for unused accounts.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">Exceptions</h2>
                    <p className="mb-6">
                        We reserve the right to decline refund requests if we detect clear abuse of our policy, such as repeatedly signing up and asking for a refund, or bulk downloading our proprietary strategy reports to then request a refund.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4">Contact</h2>
                    <p className="mb-6">
                        To request a refund or cancel your account, please reach out to <a href="mailto:billing@keystonedatahq.com">billing@keystonedatahq.com</a> or use the billing portal in your dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
