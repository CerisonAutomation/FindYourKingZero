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
                            <a href="mailto:privacy@fyking.men" className="text-primary hover:underline">
                                privacy@fyking.men
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
                        <a href="mailto:privacy@fyking.men" className="text-primary hover:underline">
                            privacy@fyking.men
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
                            href="mailto:dpo@fyking.men"
                            className="text-sm text-primary hover:underline"
                        >
                            dpo@fyking.men
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
import {motion} from 'framer-motion';
import {AlertTriangle, ArrowLeft, FileText} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';

const TermsOfService = () => {
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
                        <FileText className="w-5 h-5 text-primary"/>
                        <h1 className="text-lg font-semibold">Terms of Service</h1>
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

                    {/* Age Warning */}
                    <div className="bg-amber-500/10 border border-amber-500/20    p-4 not-prose mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>
                            <div>
                                <p className="font-semibold text-amber-500">Age Requirement</p>
                                <p className="text-sm text-amber-200/80">
                                    You must be at least 18 years old to use Find Your King. By using our
                                    service, you confirm that you are 18 or older.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-foreground">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground">
                        By accessing or using Find Your King ("the Service"), you agree to be bound
                        by these Terms of Service. If you do not agree to these terms, please do not
                        use the Service.
                    </p>

                    <h2 className="text-foreground">2. Eligibility</h2>
                    <p className="text-muted-foreground">To use Find Your King, you must:</p>
                    <ul className="text-muted-foreground">
                        <li>Be at least 18 years of age</li>
                        <li>Have the legal capacity to enter into a binding agreement</li>
                        <li>Not be prohibited from using the Service under applicable law</li>
                        <li>Not have been previously banned from the Service</li>
                        <li>Comply with all applicable laws and regulations</li>
                    </ul>

                    <h2 className="text-foreground">3. Account Registration</h2>
                    <ul className="text-muted-foreground">
                        <li>You must provide accurate and complete information</li>
                        <li>You are responsible for maintaining account security</li>
                        <li>You must not share your account credentials</li>
                        <li>You must notify us immediately of any unauthorized access</li>
                        <li>One person may only have one account</li>
                    </ul>

                    <h2 className="text-foreground">4. User Conduct</h2>
                    <p className="text-muted-foreground">You agree NOT to:</p>
                    <ul className="text-muted-foreground">
                        <li>Post false, misleading, or fraudulent information</li>
                        <li>Harass, abuse, or threaten other users</li>
                        <li>Post illegal, harmful, or offensive content</li>
                        <li>Solicit money or engage in commercial activities</li>
                        <li>Use the Service for any illegal purpose</li>
                        <li>Impersonate another person or entity</li>
                        <li>Upload malware or attempt to hack the Service</li>
                        <li>Scrape or collect user data without authorization</li>
                        <li>Create fake profiles or misrepresent your identity</li>
                    </ul>

                    <h2 className="text-foreground">5. Content Guidelines</h2>
                    <p className="text-muted-foreground">All content you post must:</p>
                    <ul className="text-muted-foreground">
                        <li>Be your own or you have rights to share</li>
                        <li>Not infringe on any third-party rights</li>
                        <li>Not contain nudity or explicit sexual content in public areas</li>
                        <li>Not promote violence, discrimination, or hate</li>
                        <li>Not include minors in any form</li>
                        <li>Accurately represent you (for profile photos)</li>
                    </ul>

                    <h2 className="text-foreground">6. Verification</h2>
                    <p className="text-muted-foreground">
                        We may require age, photo, or identity verification. Verification documents
                        are handled in accordance with our Privacy Policy and deleted after processing.
                    </p>

                    <h2 className="text-foreground">7. Subscriptions and Payments</h2>
                    <ul className="text-muted-foreground">
                        <li>Premium features require a paid subscription</li>
                        <li>Payments are processed securely through Stripe</li>
                        <li>Subscriptions auto-renew unless cancelled</li>
                        <li>No refunds for partial subscription periods</li>
                        <li>Prices may change with reasonable notice</li>
                        <li>You may cancel at any time through account settings</li>
                    </ul>

                    <h2 className="text-foreground">8. Intellectual Property</h2>
                    <p className="text-muted-foreground">
                        Find Your King and its content (excluding user content) are protected by
                        copyright, trademark, and other intellectual property laws. You may not copy,
                        modify, or distribute our content without permission.
                    </p>
                    <p className="text-muted-foreground">
                        You retain ownership of content you post but grant us a license to use,
                        display, and distribute it on the Service.
                    </p>

                    <h2 className="text-foreground">9. Safety and Interactions</h2>
                    <ul className="text-muted-foreground">
                        <li>We are not responsible for user interactions off the platform</li>
                        <li>Always exercise caution when meeting in person</li>
                        <li>Report any suspicious or harmful behavior immediately</li>
                        <li>We may remove content or users that violate these terms</li>
                    </ul>

                    <h2 className="text-foreground">10. Disclaimer of Warranties</h2>
                    <p className="text-muted-foreground">
                        The Service is provided "as is" without warranties of any kind. We do not
                        guarantee matches, relationships, or specific outcomes. We do not screen
                        all users and cannot verify all information provided by users.
                    </p>

                    <h2 className="text-foreground">11. Limitation of Liability</h2>
                    <p className="text-muted-foreground">
                        To the maximum extent permitted by law, Find Your King shall not be liable
                        for any indirect, incidental, special, consequential, or punitive damages
                        arising from your use of the Service.
                    </p>

                    <h2 className="text-foreground">12. Indemnification</h2>
                    <p className="text-muted-foreground">
                        You agree to indemnify and hold harmless Find Your King from any claims,
                        damages, or expenses arising from your use of the Service or violation of
                        these terms.
                    </p>

                    <h2 className="text-foreground">13. Termination</h2>
                    <p className="text-muted-foreground">
                        We may suspend or terminate your account at any time for violation of these
                        terms. You may delete your account at any time through account settings.
                    </p>

                    <h2 className="text-foreground">14. Dispute Resolution</h2>
                    <p className="text-muted-foreground">
                        Any disputes shall be resolved through binding arbitration in accordance
                        with applicable EU regulations. For EU residents, you retain the right to
                        bring claims in your local courts.
                    </p>

                    <h2 className="text-foreground">15. Governing Law</h2>
                    <p className="text-muted-foreground">
                        These terms are governed by the laws of the European Union and applicable
                        member state laws where we operate.
                    </p>

                    <h2 className="text-foreground">16. Changes to Terms</h2>
                    <p className="text-muted-foreground">
                        We may modify these terms at any time. We will notify you of significant
                        changes via email or in-app notification. Continued use after changes
                        constitutes acceptance.
                    </p>

                    <h2 className="text-foreground">17. Severability</h2>
                    <p className="text-muted-foreground">
                        If any provision of these terms is found unenforceable, the remaining
                        provisions will continue in full force and effect.
                    </p>

                    <h2 className="text-foreground">18. Contact</h2>
                    <p className="text-muted-foreground">
                        For questions about these Terms of Service, contact us at{' '}
                        <a href="mailto:legal@fyking.men" className="text-primary hover:underline">
                            legal@fyking.men
                        </a>
                    </p>
                </div>
            </motion.main>
        </div>
    );
};

export default TermsOfService;
import {motion} from 'framer-motion';
import {ArrowLeft, Cookie, Settings} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';
import {useCookieConsent} from '@/hooks/useConsent';

const CookiePolicy = () => {
    const navigate = useNavigate();
    const {clearConsent} = useCookieConsent();

    const handleManageCookies = () => {
        clearConsent();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5"/>
                        </Button>
                        <div className="flex items-center gap-2">
                            <Cookie className="w-5 h-5 text-primary"/>
                            <h1 className="text-lg font-semibold">Cookie Policy</h1>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleManageCookies}>
                        <Settings className="w-4 h-4 mr-2"/>
                        Manage Cookies
                    </Button>
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

                    <h2 className="text-foreground">1. What Are Cookies?</h2>
                    <p className="text-muted-foreground">
                        Cookies are small text files stored on your device when you visit a website.
                        They help websites remember your preferences and understand how you use the site.
                    </p>

                    <h2 className="text-foreground">2. How We Use Cookies</h2>
                    <p className="text-muted-foreground">
                        Find Your King uses cookies to:
                    </p>
                    <ul className="text-muted-foreground">
                        <li>Keep you logged in to your account</li>
                        <li>Remember your preferences and settings</li>
                        <li>Understand how you use our service</li>
                        <li>Improve our features and user experience</li>
                        <li>Provide personalized content (with your consent)</li>
                    </ul>

                    <h2 className="text-foreground">3. Types of Cookies We Use</h2>

                    <h3 className="text-foreground">3.1 Essential Cookies (Required)</h3>
                    <div className="bg-card rounded-lg p-4 border border-border not-prose mb-4">
                        <p className="text-sm text-muted-foreground">
                            These cookies are necessary for the website to function and cannot be
                            disabled. They are usually set in response to actions you take, such as
                            logging in or filling in forms.
                        </p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">session_id</span>
                                <span className="text-muted-foreground">Maintains your login session</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">csrf_token</span>
                                <span className="text-muted-foreground">Security token for form submissions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">fyk_consent</span>
                                <span className="text-muted-foreground">Stores your cookie preferences</span>
                            </li>
                        </ul>
                    </div>

                    <h3 className="text-foreground">3.2 Analytics Cookies (Optional)</h3>
                    <div className="bg-card rounded-lg p-4 border border-border not-prose mb-4">
                        <p className="text-sm text-muted-foreground">
                            These cookies help us understand how visitors interact with our website
                            by collecting and reporting information anonymously.
                        </p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">_ga</span>
                                <span className="text-muted-foreground">Google Analytics - distinguishes users</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">_gid</span>
                                <span className="text-muted-foreground">Google Analytics - stores session info</span>
                            </li>
                        </ul>
                    </div>

                    <h3 className="text-foreground">3.3 Marketing Cookies (Optional)</h3>
                    <div className="bg-card rounded-lg p-4 border border-border not-prose mb-4">
                        <p className="text-sm text-muted-foreground">
                            These cookies are used to track visitors across websites to display
                            relevant advertisements.
                        </p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">_fbp</span>
                                <span className="text-muted-foreground">Facebook Pixel - ad targeting</span>
                            </li>
                        </ul>
                    </div>

                    <h3 className="text-foreground">3.4 Personalization Cookies (Optional)</h3>
                    <div className="bg-card rounded-lg p-4 border border-border not-prose mb-4">
                        <p className="text-sm text-muted-foreground">
                            These cookies allow the website to remember choices you make and provide
                            enhanced, personalized features.
                        </p>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">fyk_prefs</span>
                                <span className="text-muted-foreground">Stores your display preferences</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">fyk_lang</span>
                                <span className="text-muted-foreground">Remembers your language preference</span>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-foreground">4. Managing Cookies</h2>
                    <p className="text-muted-foreground">
                        You can manage your cookie preferences at any time by clicking the
                        "Manage Cookies" button at the top of this page.
                    </p>
                    <p className="text-muted-foreground">
                        You can also control cookies through your browser settings:
                    </p>
                    <ul className="text-muted-foreground">
                        <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                        <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                        <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                        <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
                    </ul>
                    <p className="text-muted-foreground">
                        Note: Blocking essential cookies may prevent you from using certain
                        features of our service.
                    </p>

                    <h2 className="text-foreground">5. Third-Party Cookies</h2>
                    <p className="text-muted-foreground">
                        Some cookies are set by third-party services that appear on our pages.
                        We do not control these cookies. Please refer to the respective third
                        parties for more information about their cookies and privacy policies:
                    </p>
                    <ul className="text-muted-foreground">
                        <li>
                            <a href="https://policies.google.com/privacy" className="text-primary hover:underline">
                                Google Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/policy.php" className="text-primary hover:underline">
                                Facebook Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="https://stripe.com/privacy" className="text-primary hover:underline">
                                Stripe Privacy Policy
                            </a>
                        </li>
                    </ul>

                    <h2 className="text-foreground">6. Cookie Retention</h2>
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 text-foreground">Cookie Type</th>
                            <th className="text-left py-2 text-foreground">Duration</th>
                        </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                            <td className="py-2">Session cookies</td>
                            <td className="py-2">Until you close your browser</td>
                        </tr>
                        <tr className="border-b border-border/50">
                            <td className="py-2">Authentication cookies</td>
                            <td className="py-2">30 days (or until logout)</td>
                        </tr>
                        <tr className="border-b border-border/50">
                            <td className="py-2">Preference cookies</td>
                            <td className="py-2">1 year</td>
                        </tr>
                        <tr className="border-b border-border/50">
                            <td className="py-2">Analytics cookies</td>
                            <td className="py-2">2 years</td>
                        </tr>
                        </tbody>
                    </table>

                    <h2 className="text-foreground">7. Updates to This Policy</h2>
                    <p className="text-muted-foreground">
                        We may update this Cookie Policy from time to time. Any changes will be
                        posted on this page with an updated revision date.
                    </p>

                    <h2 className="text-foreground">8. Contact Us</h2>
                    <p className="text-muted-foreground">
                        If you have questions about our use of cookies, contact us at{' '}
                        <a href="mailto:privacy@fyking.men" className="text-primary hover:underline">
                            privacy@fyking.men
                        </a>
                    </p>
                </div>
            </motion.main>
        </div>
    );
};

export default CookiePolicy;
import {Link} from 'react-router-dom';
import {AlertTriangle, ArrowLeft, Camera, Heart, MessageCircle, Shield, Users} from 'lucide-react';

const rules = [
    {
        icon: Heart,
        title: 'Respect & Dignity',
        body: 'Treat every member with respect. Hate speech, discrimination, or harassment based on race, ethnicity, gender identity, sexual orientation, religion, disability, or any other characteristic will result in immediate ban.'
    },
    {
        icon: Camera,
        title: 'Authentic Profiles',
        body: 'Use real photos of yourself. Do not impersonate others, use stock photos, or misrepresent your identity. Catfishing is a bannable offense.'
    },
    {
        icon: Shield,
        title: 'Age Policy (18+)',
        body: 'You must be 18 or older to use FindYourKing. Any content involving minors is strictly prohibited and will be reported to law enforcement.'
    },
    {
        icon: AlertTriangle,
        title: 'Zero Tolerance for Scams',
        body: 'Do not solicit money, financial information, or personal documents from other users. Scammers are banned and reported.'
    },
    {
        icon: MessageCircle,
        title: 'Consensual Communication',
        body: 'Respect when someone is not interested. Repeated unwanted messages, threats, or coercion are not tolerated.'
    },
    {
        icon: Users,
        title: 'Events & Parties',
        body: 'Event hosts are responsible for safety at their gatherings. Do not share event addresses publicly without host permission. Panic button is available for all attendees.'
    },
];

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Link to="/"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4"/> Back
                </Link>
                <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
                <p className="text-muted-foreground mb-8">These rules keep FindYourKing safe and welcoming for
                    everyone.</p>
                <div className="space-y-6">
                    {rules.map(({icon: Icon, title, body}) => (
                        <div key={title} className="flex gap-4 p-5  bg-card border border-border/40">
                            <div className="w-10 h-10  bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-primary"/>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-5  bg-destructive/5 border border-destructive/20">
                    <h3 className="font-semibold text-destructive mb-2">Reporting Violations</h3>
                    <p className="text-sm text-muted-foreground">
                        Report any user, message, or event from the three-dot menu or the Safety Center. Our moderation
                        team reviews reports within 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
import {Link} from 'react-router-dom';
import {AlertTriangle, ArrowLeft, Eye, Lock, MapPin, Phone, Shield} from 'lucide-react';

const tips = [
    {
        icon: Eye,
        category: 'Before Meeting',
        items: ['Video call first to verify identity', 'Research the person on social media', 'Trust your instincts — if something feels off, it probably is', 'Never send money to someone you have not met in person']
    },
    {
        icon: MapPin,
        category: 'Meeting in Person',
        items: ['Always meet in a public place first', 'Tell a trusted friend where you are going and who you are meeting', 'Arrange your own transportation', 'Keep your phone charged and with you at all times']
    },
    {
        icon: Lock,
        category: 'Protecting Your Privacy',
        items: ['Don\'t share your full name, address, or workplace early on', 'Use the in-app messaging instead of sharing your phone number immediately', 'Be cautious about photos you share — check for location metadata', 'Use incognito mode if you don\'t want others to see you browsing']
    },
    {
        icon: Shield,
        category: 'At Events & Parties',
        items: ['Use the safety check-in feature when you arrive', 'Keep the panic button accessible in the app', 'Don\'t accept drinks from strangers or leave your drink unattended', 'Have an exit strategy and know how to get home safely']
    },
    {
        icon: AlertTriangle,
        category: 'Recognising Red Flags',
        items: ['Pressure to move off-platform immediately', 'Requests for financial information or money', 'Inconsistent stories or refusal to video call', 'Overly intense or controlling behaviour early on']
    },
];

export default function SafetyTips() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Link to="/"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4"/> Back
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary"/>
                    <h1 className="text-3xl font-bold">Safety Tips</h1>
                </div>
                <p className="text-muted-foreground mb-8">Your safety is our priority. Follow these tips to stay
                    safe.</p>
                <div className="space-y-6">
                    {tips.map(({icon: Icon, category, items}) => (
                        <div key={category} className="p-5  bg-card border border-border/40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9  bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-primary"/>
                                </div>
                                <h3 className="font-semibold">{category}</h3>
                            </div>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-5  bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <Phone className="w-6 h-6 text-primary shrink-0"/>
                    <div>
                        <p className="font-semibold text-sm">Emergency? Call 999 (UK) / 911 (US)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">If you are in immediate danger, always
                            contact emergency services first.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
