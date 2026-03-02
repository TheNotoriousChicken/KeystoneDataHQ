import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    { question: "How long does setup take?", answer: "Once you sign up, our team connects to your platforms via API. Your baseline dashboard is usually live within 48 hours." },
    { question: "Do I need technical skills?", answer: "None. We built Keystone Data HQ so founders and operators can see the numbers without needing to write SQL or configure pipelines." },
    { question: "Can I upgrade later?", answer: "Yes, you can move from Starter to Growth anytime seamlessly, prorating the difference on your next invoice." },
    { question: "What platforms do you support?", answer: "Currently we support Shopify, Meta Ads, Google Analytics 4, and Klaviyo natively. Custom endpoints are available on the Enterprise tier." }
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function Pricing() {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    return (
        <div className="px-6 py-24 pb-32 relative overflow-hidden bg-brand-bg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40rem] bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_60%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Simple pricing for serious growth.</motion.h1>
                    <motion.p variants={fadeUp} className="text-xl text-brand-muted">Stop flying blind. Get the clarity you need to scale profitably today.</motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32"
                >
                    {/* Starter Plan */}
                    <motion.div
                        variants={fadeUp}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="glass-panel p-10 flex flex-col h-full border-brand-border/50 hover:border-brand-border transition-colors duration-300"
                    >
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <p className="text-brand-muted mb-6">Essential visibility for emerging brands.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold tracking-tighter">$500</span>
                            <span className="text-brand-muted font-medium">/mo</span>
                        </div>

                        <button className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary text-white py-3 rounded-xl font-semibold transition-colors mb-8">
                            Get Started
                        </button>

                        <div className="flex-1">
                            <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-brand-muted">What's included:</p>
                            <ul className="space-y-4">
                                {['Basic Integrations (Shopify, Meta)', 'Standard KPI Dashboard', 'Monthly Strategy Report', 'Email Support'].map((feature, i) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex flex-start gap-3 text-brand-muted"
                                    >
                                        <Check className="w-5 h-5 text-brand-secondary shrink-0" />
                                        <span>{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Growth Plan - Highlighted */}
                    <motion.div
                        variants={fadeUp}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="glass-panel p-10 flex flex-col h-full border-brand-primary shadow-[0_0_50px_rgba(6,182,212,0.15)] hover:shadow-[0_0_70px_rgba(6,182,212,0.25)] relative transition-shadow transition-colors duration-300"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg shadow-brand-primary/30">
                            Most Popular
                        </div>

                        <h3 className="text-2xl font-bold mb-2">Growth</h3>
                        <p className="text-brand-muted mb-6">The complete outsourced data department.</p>
                        <div className="mb-8 relative inline-block">
                            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full" />
                            <span className="relative text-5xl font-bold tracking-tighter text-brand-primary drop-shadow-sm">$1,500</span>
                            <span className="relative text-brand-muted font-medium">/mo</span>
                        </div>

                        <button className="w-full bg-brand-primary hover:bg-brand-primary-hover shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] text-white py-3 rounded-xl font-bold transition-all mb-8">
                            Get Started
                        </button>

                        <div className="flex-1">
                            <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-white">Everything in Starter, plus:</p>
                            <ul className="space-y-4">
                                {['All Integrations (Inc. GA4, Klaviyo)', 'Weekly Strategy Zoom Call', 'Custom KPI Definitions', 'Slack Channel Access', 'Attribution Modeling'].map((feature, i) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + (i * 0.1) }}
                                        className="flex flex-start gap-3"
                                    >
                                        <Check className="w-5 h-5 text-brand-primary shrink-0 drop-shadow-sm" />
                                        <span className="text-white font-medium">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-3xl mx-auto"
                >
                    <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center tracking-tight mb-12">Frequently Asked Questions</motion.h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <motion.div key={index} variants={fadeUp} className="glass-panel border-brand-border/50 overflow-hidden hover:border-brand-border transition-colors">
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                                    >
                                        <span className="font-semibold text-lg text-white">{faq.question}</span>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-brand-primary' : 'text-brand-muted'}`} />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="px-6 relative overflow-hidden"
                                            >
                                                <div className="pb-5 pt-2">
                                                    <p className="text-brand-muted leading-relaxed">{faq.answer}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
