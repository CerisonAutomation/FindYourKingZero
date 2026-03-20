import {useState} from 'react';
import {motion} from 'framer-motion';
import {AlertTriangle, Calendar, CheckCircle, Shield} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {useVerification} from '@/hooks/useVerification';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';

interface AgeVerificationProps {
    onComplete?: () => void;
    onSkip?: () => void;
}

export const AgeVerification = ({onComplete, onSkip}: AgeVerificationProps) => {
    const [day, setDay] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [error, setError] = useState<string>('');

    const {submitAgeVerification, isSubmitting} = useVerification();

    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 100}, (_, i) => currentYear - 18 - i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const days = Array.from({length: 31}, (_, i) => i + 1);

    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = () => {
        setError('');

        if (!day || !month || !year) {
            setError('Please enter your complete date of birth.');
            return;
        }

        const birthDate = new Date(parseInt(year), parseInt(month), parseInt(day));
        const age = calculateAge(birthDate);

        if (age < 18) {
            setError('You must be at least 18 years old to use Find Your King.');
            return;
        }

        submitAgeVerification(birthDate, {
            onSuccess: () => {
                onComplete?.();
            },
        });
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="bg-card rounded-2xl p-6 border border-border shadow-xl max-w-md mx-auto"
        >
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary"/>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Age Verification</h2>
                <p className="text-muted-foreground text-sm">
                    To comply with EU regulations, we need to verify you're at least 18 years old.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0"/>
                    <p className="text-xs text-amber-200">
                        This service is for adults only. By continuing, you confirm you are 18 or older.
                    </p>
                </div>

                <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4"/>
                        Date of Birth
                    </Label>

                    <div className="grid grid-cols-3 gap-2">
                        <Select value={day} onValueChange={setDay}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Day"/>
                            </SelectTrigger>
                            <SelectContent>
                                {days.map((d) => (
                                    <SelectItem key={d} value={d.toString()}>
                                        {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Month"/>
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m, index) => (
                                    <SelectItem key={m} value={index.toString()}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Year"/>
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        className="p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                    >
                        <p className="text-sm text-destructive">{error}</p>
                    </motion.div>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                    {isSubmitting ? (
                        'Verifying...'
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2"/>
                            Verify My Age
                        </>
                    )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    Your date of birth is stored securely and used only for age verification.
                    See our{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </motion.div>
    );
};
