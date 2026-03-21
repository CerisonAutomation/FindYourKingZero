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
