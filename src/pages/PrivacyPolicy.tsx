import {motion} from 'framer-motion';
import {ArrowLeft, Mail, MapPin, Shield} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary"/>
                        <h1 className="text-lg font-semibold">Privacy Policy</h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <motion.main
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="max-w-4xl mx-auto px-4 py-8"
            >
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-muted-foreground">Last updated: January 2025</p>

                    <h2 className="text-foreground">1. Introduction</h2>
                    <p className="text-muted-foreground">
                        Find Your King ("we", "our", or "us") is committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you use our dating platform and services.
                    </p>
                    <p className="text-muted-foreground">
                        We comply with the EU General Data Protection Regulation (GDPR) and other
                        applicable data protection laws.
                    </p>

                    <h2 className="text-foreground">2. Data Controller</h2>
                    <div className="bg-card    p-4 border border-border not-prose">
                        <p className="text-sm text-muted-foreground mb-2">Data Controller:</p>
                        <p className="text-foreground font-medium">Find Your King Ltd.</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4"/>
                            <span>EU Headquarters Address</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4"/>
                            <a href="mailto:privacy@findyourking.com" className="text-primary hover:underline">
                                privacy@findyourking.com
                            </a>
                        </div>
                    </div>

                    <h2 className="text-foreground">3. Information We Collect</h2>

                    <h3 className="text-foreground">3.1 Information You Provide</h3>
                    <ul className="text-muted-foreground">
                        <li><strong>Account Information:</strong> Email, password, display name, date of birth</li>
                        <li><strong>Profile Information:</strong> Photos, bio, physical attributes, interests, location
                        </li>
                        <li><strong>Verification Documents:</strong> Selfies, ID documents (deleted after verification)
                        </li>
                        <li><strong>Communications:</strong> Messages sent through the platform</li>
                        <li><strong>Payment Information:</strong> Processed securely by Stripe (we don't store card
                            details)
                        </li>
                    </ul>

                    <h3 className="text-foreground">3.2 Information Collected Automatically</h3>
                    <ul className="text-muted-foreground">
                        <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
                        <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                        <li><strong>Location Data:</strong> Approximate location based on IP or GPS (with consent)</li>
                        <li><strong>Cookies:</strong> Session cookies and optional analytics/marketing cookies</li>
                    </ul>

                    <h2 className="text-foreground">4. Legal Basis for Processing</h2>
                    <p className="text-muted-foreground">We process your data based on:</p>
                    <ul className="text-muted-foreground">
                        <li><strong>Contract:</strong> To provide our dating services</li>
                        <li><strong>Consent:</strong> For optional features like marketing communications</li>
                        <li><strong>Legitimate Interest:</strong> For safety, fraud prevention, and service improvement
                        </li>
                        <li><strong>Legal Obligation:</strong> To comply with laws and regulations</li>
                    </ul>

                    <h2 className="text-foreground">5. How We Use Your Information</h2>
                    <ul className="text-muted-foreground">
                        <li>To create and manage your account</li>
                        <li>To match you with other users</li>
                        <li>To verify your identity and age</li>
                        <li>To process payments and subscriptions</li>
                        <li>To send important service notifications</li>
                        <li>To improve and personalize your experience</li>
                        <li>To ensure platform safety and prevent abuse</li>
                    </ul>

                    <h2 className="text-foreground">6. Data Sharing</h2>
                    <p className="text-muted-foreground">We may share your data with:</p>
                    <ul className="text-muted-foreground">
                        <li><strong>Other Users:</strong> Profile information you choose to make public</li>
                        <li><strong>Service Providers:</strong> Payment processors, cloud hosting, analytics</li>
                        <li><strong>Legal Authorities:</strong> When required by law or to protect safety</li>
                    </ul>
                    <p className="text-muted-foreground">
                        We never sell your personal data to third parties for marketing purposes.
                    </p>

                    <h2 className="text-foreground">7. Data Retention</h2>
                    <ul className="text-muted-foreground">
                        <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                        <li><strong>Deleted Accounts:</strong> Data deleted within 30 days of deletion request</li>
                        <li><strong>Verification Documents:</strong> Deleted within 24 hours of verification</li>
                        <li><strong>Messages:</strong> Retained for platform safety; anonymized on deletion</li>
                        <li><strong>Legal Requirements:</strong> Some data retained as required by law</li>
                    </ul>

                    <h2 className="text-foreground">8. Your Rights (GDPR)</h2>
                    <p className="text-muted-foreground">You have the right to:</p>
                    <ul className="text-muted-foreground">
                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                        <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                        <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                        <li><strong>Restriction:</strong> Limit how we process your data</li>
                        <li><strong>Object:</strong> Object to certain types of processing</li>
                        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                    </ul>
                    <p className="text-muted-foreground">
                        To exercise these rights, visit your account settings or contact us at{' '}
                        <a href="mailto:privacy@findyourking.com" className="text-primary hover:underline">
                            privacy@findyourking.com
                        </a>
                    </p>

                    <h2 className="text-foreground">9. International Transfers</h2>
                    <p className="text-muted-foreground">
                        Your data may be transferred to and processed in countries outside the EU.
                        We ensure appropriate safeguards are in place, including Standard Contractual
                        Clauses approved by the European Commission.
                    </p>

                    <h2 className="text-foreground">10. Security</h2>
                    <p className="text-muted-foreground">
                        We implement appropriate technical and organizational measures to protect your
                        data, including encryption, access controls, and regular security assessments.
                    </p>

                    <h2 className="text-foreground">11. Children's Privacy</h2>
                    <p className="text-muted-foreground">
                        Our service is only available to users 18 years or older. We do not knowingly
                        collect data from minors. If we discover we have collected data from a minor,
                        we will delete it immediately.
                    </p>

                    <h2 className="text-foreground">12. Changes to This Policy</h2>
                    <p className="text-muted-foreground">
                        We may update this policy from time to time. We will notify you of significant
                        changes via email or in-app notification. Continued use after changes
                        constitutes acceptance.
                    </p>

                    <h2 className="text-foreground">13. Contact Us</h2>
                    <p className="text-muted-foreground">
                        For privacy-related questions or to exercise your rights, contact our
                        Data Protection Officer:
                    </p>
                    <div className="bg-card    p-4 border border-border not-prose">
                        <p className="text-foreground font-medium">Data Protection Officer</p>
                        <p className="text-sm text-muted-foreground">Find Your King Ltd.</p>
                        <a
                            href="mailto:dpo@findyourking.com"
                            className="text-sm text-primary hover:underline"
                        >
                            dpo@findyourking.com
                        </a>
                    </div>

                    <h2 className="text-foreground">14. Supervisory Authority</h2>
                    <p className="text-muted-foreground">
                        You have the right to lodge a complaint with a supervisory authority if you
                        believe your data protection rights have been violated. Contact your local
                        EU Data Protection Authority.
                    </p>
                </div>
            </motion.main>
        </div>
    );
};

export default PrivacyPolicy;
