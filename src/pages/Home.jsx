import { ArrowRight, BarChart3, TrendingUp, Zap, CheckCircle2, Shield, LineChart, Target, MousePointerClick, ChevronRight, Star, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function Home() {
    return (
        <div className="flex flex-col bg-brand-bg relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50rem] bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none" />

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-sm font-medium text-brand-primary mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        Keystone Data HQ 2.0 is Live
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-8"
                    >
                        Stop Guessing. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-[#38BDF8] to-brand-secondary drop-shadow-sm">
                            Start Scaling.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-xl md:text-2xl text-brand-muted max-w-3xl mx-auto leading-relaxed mb-12"
                    >
                        The outsourced data department for growing e-commerce brands. We turn messy numbers from Shopify, Meta, and GA4 into automated, profitable insights.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <button className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] hover:-translate-y-1 text-lg">
                            Book Strategy Call
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <Link to="/pricing" className="w-full sm:w-auto bg-brand-surface/80 border border-brand-border hover:border-brand-primary text-white px-8 py-4 rounded-xl font-semibold transition-all hover:bg-brand-surface text-lg text-center">
                            View Pricing
                        </Link>
                    </motion.div>

                    {/* Hero Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 25 }}
                        animate={{ opacity: 1, y: 0, rotateX: 12 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        whileHover={{ rotateX: 0, transition: { duration: 0.5 } }}
                        className="relative max-w-5xl mx-auto perspective-1000"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent z-20 pointer-events-none" />
                        <div className="glass-panel p-2 md:p-4 rounded-2xl shadow-2xl shadow-black/50 border border-brand-primary/20 bg-brand-surface/50 backdrop-blur-xl">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
                                alt="Keystone Data Platform Preview"
                                className="rounded-xl border border-brand-border/50 opacity-90"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Logic Cloud / Integrations */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="py-12 border-y border-brand-border/30 bg-brand-surface/10"
            >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-brand-muted mb-8 tracking-widest uppercase">Natively Integrating With Your Stack</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Shopify', 'Meta Ads', 'Google Analytics 4', 'Klaviyo', 'Stripe', 'TikTok Ads'].map((brand) => (
                            <span key={brand} className="text-2xl font-black tracking-tight text-white/80 hover:text-white transition-colors">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* The Problem Section */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                        >
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                You're drowning in data, <br />
                                <span className="text-rose-400">but starving for clarity.</span>
                            </motion.h2>
                            <div className="space-y-6 text-lg text-brand-muted">
                                <motion.p variants={fadeUp}>
                                    Founders spend hours exporting CSVs, fighting attribution windows, and guessing which ad actually drove the sale.
                                </motion.p>
                                <motion.div variants={fadeUp} className="flex items-start gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                    <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-1" />
                                    <p>Shopify says you made $10k. Meta says you made $15k. GA4 says you made $8k. Who do you trust when scaling your budget?</p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid grid-cols-2 gap-4"
                        >
                            <motion.div variants={fadeUp} className="glass-panel p-6 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
                                <div className="text-red-400 font-medium mb-2 text-sm">Discrepancy Rate</div>
                                <div className="text-4xl font-bold text-white mb-2">34%</div>
                                <p className="text-xs text-brand-muted">Average variance between platform reporting and actual cash in bank.</p>
                            </motion.div>
                            <motion.div variants={fadeUp} className="glass-panel p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent translate-y-8">
                                <div className="text-amber-400 font-medium mb-2 text-sm">Time Wasted</div>
                                <div className="text-4xl font-bold text-white mb-2">12hrs</div>
                                <p className="text-xs text-brand-muted">Spent weekly by founders compiling manual spreadsheet reports.</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6 bg-brand-surface/20 border-y border-brand-border/30 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl opacity-50" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">The complete outsourced data stack.</h2>
                        <p className="text-xl text-brand-muted">We handle the plumbing, the pipelines, and the visualization so you can focus on making decisions that drive revenue.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: LineChart,
                                title: "Blended Metrics",
                                desc: "Real-time visualizations of True ROAS and Blended CAC. Stop relying on inflated ad platform metrics.",
                                colorClass: "brand-primary",
                                colorCode: "rgba(6,182,212,",
                                items: ['Live API syncs', 'Custom KPI formulas', 'Cash-in-bank tracking']
                            },
                            {
                                icon: Shield,
                                title: "Single Source of Truth",
                                desc: "We unify data from Shopify, Meta Ads, and GA4 into a cohesive database owned by you.",
                                colorClass: "brand-secondary",
                                colorCode: "rgba(16,185,129,",
                                items: ['Shopify native app', 'Secure data vault', 'Historical imports']
                            },
                            {
                                icon: Target,
                                title: "Human Strategy",
                                desc: "Dashboards don't make decisions. Get human-reviewed insights delivered directly to your inbox.",
                                colorClass: "purple-500",
                                colorCode: "rgba(168,85,247,",
                                items: ['Weekly strategy memos', 'Trend spotting', 'Growth recommendations']
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className={`glass-panel p-8 rounded-2xl group hover:shadow-[0_20px_40px_-15px_${feature.colorCode}0.3)] hover:border-${feature.colorClass}/50 transition-all duration-300`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-${feature.colorClass}/10 border border-${feature.colorClass}/20 flex items-center justify-center mb-6 text-${feature.colorClass} ${feature.colorClass === 'purple-500' ? 'text-purple-400' : ''} group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-brand-muted leading-relaxed mb-6">{feature.desc}</p>
                                <ul className="space-y-3">
                                    {feature.items.map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-sm font-medium text-brand-muted">
                                            <CheckCircle2 className="w-4 h-4 text-brand-secondary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Onboard in minutes. Profitable in days.</h2>
                        <p className="text-xl text-brand-muted">Zero technical setup required on your end.</p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-4 gap-4 relative"
                    >
                        <div className="hidden md:block absolute top-[28px] left-[10%] w-[80%] h-0.5 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20" />

                        {[
                            { step: '01', title: 'Connect', desc: 'Auth your Shopify and Ad accounts securely via standard APIs.' },
                            { step: '02', title: 'Sync', desc: 'Our automated pipelines extract, clean, and map your historical data.' },
                            { step: '03', title: 'Visualize', desc: 'Access your fully-populated, real-time custom dashboard.' },
                            { step: '04', title: 'Scale', desc: 'Make budget allocation decisions based on mathematically proven ROI.' }
                        ].map((s, i) => (
                            <motion.div key={i} variants={fadeUp} className="relative z-10 glass-panel p-6 border-brand-border/40 hover:border-brand-primary/50 transition-colors group">
                                <div className="w-14 h-14 rounded-full bg-brand-surface border-2 border-brand-primary text-brand-primary font-bold text-xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-lg">
                                    {s.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                                <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonial */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                className="py-24 px-6 bg-brand-surface/30"
            >
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />)}
                    </div>
                    <blockquote className="text-2xl md:text-4xl font-semibold leading-tight mb-8">
                        "Before Keystone, we were spending 10+ hours a week fighting spreadsheets to figure out our actual CAC. Now it's literally the first tab I check every morning."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 p-1">
                            <div className="w-full h-full bg-brand-surface rounded-full flex items-center justify-center text-white font-bold">JD</div>
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-white text-lg">James Davidson</div>
                            <div className="text-brand-muted text-sm">Founder, Aura Athletics (8-figure D2C)</div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5" />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none"
                />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                    className="max-w-4xl mx-auto text-center relative z-10 glass-panel p-16 rounded-3xl border-brand-primary/30 shadow-[0_0_100px_rgba(6,182,212,0.1)] hover:shadow-[0_0_120px_rgba(6,182,212,0.15)] transition-shadow duration-500"
                >
                    <h2 className="text-5xl font-bold mb-6 tracking-tight">Ready to see your real numbers?</h2>
                    <p className="text-xl text-brand-muted mb-10 max-w-2xl mx-auto">
                        Join 40+ scaling operators who use Keystone Data HQ as their financial source of truth.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto bg-white text-brand-bg hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
                            Start Your Free Audit
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <span className="text-brand-muted font-medium px-4">or</span>
                        <Link to="/pricing" className="text-brand-primary hover:text-white font-semibold transition-colors flex items-center gap-1">
                            View Plans & Pricing <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
