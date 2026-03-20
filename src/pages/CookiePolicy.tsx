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
                        <a href="mailto:privacy@findyourking.com" className="text-primary hover:underline">
                            privacy@findyourking.com
                        </a>
                    </p>
                </div>
            </motion.main>
        </div>
    );
};

export default CookiePolicy;
