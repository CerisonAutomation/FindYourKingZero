import {useNavigate} from 'react-router-dom';
import {ChevronRight} from 'lucide-react';
import {motion} from 'framer-motion';
import React from 'react';

interface SubPageShellProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const SubPageShell = ({title, icon: Icon, children, action}: SubPageShellProps) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header — minimal, no card wrapper */}
            <header
                className="sticky top-0 z-40 border-b border-border/12 px-4 py-2.5"
                style={{background: 'hsl(var(--background)/0.94)', backdropFilter: 'blur(20px)'}}
            >
                <div className="flex items-center gap-2.5 max-w-lg mx-auto">
                    <button
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground active:scale-90 transition-all"
                        style={{borderRadius: '6px', background: 'hsl(var(--secondary)/0.5)'}}
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                    >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180"/>
                    </button>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0"/>
                        <h1 className="text-[13.5px] font-black truncate">{title}</h1>
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            </header>

            <motion.div
                initial={{opacity: 0, y: 6}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                className="px-4 py-3 space-y-2.5 max-w-lg mx-auto"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SubPageShell;
