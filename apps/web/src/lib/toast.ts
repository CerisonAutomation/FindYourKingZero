// Gamechanger #11 — Sonner: 1-line toasts replacing all alert/console patterns
import { toast } from 'sonner';

export const notify = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  promise: <T,>(p: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
    toast.promise(p, msgs),
};
