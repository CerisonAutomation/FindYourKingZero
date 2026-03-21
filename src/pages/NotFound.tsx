import {useLocation, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {motion} from "framer-motion";
import {ArrowLeft, Compass, Crown} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";

const NotFound = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user, isLoading} = useAuth();

    useEffect(() => {
        console.error("404:", location.pathname);
    }, [location.pathname]);

    // Smart redirect — signed in → grid, not signed in → home
    const goHome = () => {
        if (user) {
            navigate("/app/grid", {replace: true});
        } else {
            navigate("/", {replace: true});
        }
    };

    // Auto-redirect after 5 seconds
    useEffect(() => {
        if (isLoading) return;
        const timer = setTimeout(goHome, 5000);
        return () => clearTimeout(timer);
    }, [isLoading, user]);

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{background: "hsl(var(--background))"}}
        >
            {/* Nebula ambient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
            radial-gradient(ellipse 70% 50% at 20% 30%, hsl(214 85% 58% / 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, hsl(42 98% 56% / 0.06) 0%, transparent 55%)
          `,
                }}
            />
            {/* Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
                    backgroundSize: "80px 80px",
                }}
            />

            <motion.div
                initial={{opacity: 0, y: 32}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="relative z-10 text-center px-6 max-w-md"
            >
                {/* Crown icon */}
                <motion.div
                    initial={{scale: 0, rotate: -20}}
                    animate={{scale: 1, rotate: 0}}
                    transition={{delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1]}}
                    className="w-16 h-16 mx-auto mb-8 flex items-center justify-center"
                    style={{
                        background: "hsl(var(--surface-2))",
                        border: "1px solid hsl(var(--border-strong))",
                        boxShadow: "var(--shadow-glow-gold)",
                    }}
                >
                    <Crown className="w-7 h-7" style={{color: "hsl(var(--primary))"}} strokeWidth={1.5}/>
                </motion.div>

                {/* 404 */}
                <div
                    className="font-black leading-none tracking-[-0.06em] mb-4"
                    style={{
                        fontSize: "clamp(72px, 16vw, 120px)",
                        background: "var(--gradient-king)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    404
                </div>

                <div
                    className="w-8 h-[1px] mx-auto mb-6"
                    style={{background: "hsl(var(--primary))"}}
                />

                <h1 className="text-[18px] font-black tracking-[-0.02em] mb-3">
                    PAGE NOT FOUND
                </h1>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
                    This throne is empty. The page you're looking for doesn't exist or has been moved.
                </p>
                <p className="text-[11px] text-muted-foreground/50 mb-8">
                    Redirecting to {user ? 'Discover' : 'Home'} in 5 seconds...
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 h-10 text-[12px] font-black tracking-[0.08em] uppercase transition-all duration-120 active:scale-[0.97]"
                        style={{
                            background: "transparent",
                            color: "hsl(var(--foreground))",
                            border: "1px solid hsl(var(--border-strong))",
                        }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5"/>
                        Go Back
                    </button>
                    <button
                        onClick={goHome}
                        className="flex items-center justify-center gap-2 px-6 h-10 text-[12px] font-black tracking-[0.08em] uppercase transition-all duration-120 active:scale-[0.97]"
                        style={{
                            background: "var(--gradient-primary)",
                            color: "#fff",
                            boxShadow: "0 4px 20px hsl(42 98% 56% / 0.35)",
                        }}
                    >
                        <Compass className="w-3.5 h-3.5"/>
                        {user ? 'Go to Discover' : 'Return Home'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
