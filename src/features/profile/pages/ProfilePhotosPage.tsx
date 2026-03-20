import {useNavigate} from 'react-router-dom';
import {Camera, ChevronLeft, Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/hooks/useAuth';

export default function ProfilePhotosPage() {
    const navigate = useNavigate();
    const {user} = useAuth();

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-primary"/>My
                    Photos</h1>
            </header>

            <div className="px-4 py-5">
                <p className="text-sm text-muted-foreground mb-4">Up to 9 photos. Drag to reorder. Star to set as
                    primary.</p>
                <div className="grid grid-cols-3 gap-2">
                    <label
                        className="aspect-square rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Plus className="w-6 h-6 text-muted-foreground mb-1"/>
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                        <input type="file" accept="image/*" className="hidden"/>
                    </label>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">Photos are stored securely and only
                    visible per your privacy settings.</p>
            </div>
        </div>
    );
}
