// SECTION 5: GAP FIXES - Top 10 Priority Features

// 1. TYPING INDICATORS
export const useTypingIndicator = (conversationId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!conversationId) return;
    const ch = realtime.subscribe(`typing:${conversationId}`, (c) => {
      c.on("presence", { event: "sync" }, () => {
        const state = c.presenceState();
        const typers = Object.values(state).flat()
          .filter((p: any) => p.user_id !== user?.id && p.is_typing)
          .map((p: any) => p.user_id);
        setTypingUsers(typers);
      });
    });
    return () => { realtime.unsubscribe(`typing:${conversationId}`); };
  }, [conversationId, user?.id]);
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;
    await supabase.channel(`typing:${conversationId}`).track({ user_id: user.id, is_typing: isTyping, updated_at: Date.now() });
  }, [conversationId, user]);
  return { typingUsers, setTyping };
};

// 2. DISTANCE FILTER
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useDistanceFilter = () => {
  const [maxDistance, setMaxDistance] = useState(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}, { enableHighAccuracy: true }
      );
    }
  }, []);
  const filterByDistance = useCallback((profiles: UserProfile[]) => {
    if (!userLocation) return profiles;
    return profiles.filter((p) => {
      if (!p.lat || !p.lng) return false;
      return haversine(userLocation.lat, userLocation.lng, p.lat, p.lng) <= maxDistance;
    });
  }, [userLocation, maxDistance]);
  return { maxDistance, setMaxDistance, userLocation, filterByDistance };
};

// 3. SWIPE MODE
export const useSwipeMode = (profiles: UserProfile[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedRight, setSwipedRight] = useState<string[]>([]);
  const [swipedLeft, setSwipedLeft] = useState<string[]>([]);
  const current = profiles[currentIndex] || null;
  const swipeRight = useCallback(() => {
    if (!current) return;
    setSwipedRight((prev) => [...prev, current.id]);
    setCurrentIndex((i) => i + 1);
  }, [current]);
  const swipeLeft = useCallback(() => {
    if (!current) return;
    setSwipedLeft((prev) => [...prev, current.id]);
    setCurrentIndex((i) => i + 1);
  }, [current]);
  const undo = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setSwipedRight((prev) => prev.slice(0, -1));
    setSwipedLeft((prev) => prev.slice(0, -1));
  }, [currentIndex]);
  return { current, currentIndex, swipeRight, swipeLeft, undo, swipedRight, swipedLeft, total: profiles.length };
};

// 4. PROFILE COMPLETENESS
export const useProfileCompleteness = (profile: UserProfile | null) => {
  const fields = [
    { key: "display_name", label: "Name", weight: 15 },
    { key: "bio", label: "Bio", weight: 20 },
    { key: "avatar_url", label: "Profile Photo", weight: 25 },
    { key: "age", label: "Age", weight: 10 },
    { key: "location", label: "Location", weight: 10 },
    { key: "interests", label: "Interests", weight: 10 },
    { key: "looking_for", label: "Looking For", weight: 10 },
  ];
  const completed = fields.filter((f) => {
    const val = (profile as any)?.[f.key];
    return val !== null && val !== undefined && val !== "" && (!Array.isArray(val) || val.length > 0);
  });
  const percentage = completed.reduce((sum, f) => sum + f.weight, 0);
  const missing = fields.filter((f) => !completed.includes(f));
  return { percentage, completed, missing, isComplete: percentage >= 90 };
};

// 5. MESSAGE SEARCH
export const useMessageSearch = (conversationId?: string) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);
  const search = useCallback(async (q: string) => {
    if (!conversationId || !q.trim()) { setResults([]); return; }
    setSearching(true);
    setQuery(q);
    const { data } = await supabase.from("messages").select("*")
      .eq("room_id", conversationId).ilike("content", `%${q}%`)
      .order("created_at", { ascending: false }).limit(20);
    setResults((data as Message[]) || []);
    setSearching(false);
  }, [conversationId]);
  return { query, results, searching, search };
};

// 6. PUSH NOTIFICATIONS
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted" && "serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_KEY || ""),
      });
      setSubscription(sub);
      const { user } = (await auth.getSession()).data;
      if (user) await supabase.from("push_subscriptions").upsert({ user_id: user.id, subscription: JSON.stringify(sub) });
    }
    return result === "granted";
  }, []);
  const sendLocal = useCallback((title: string, body: string, icon?: string) => {
    if (permission === "granted") new Notification(title, { body, icon });
  }, [permission]);
  return { permission, requestPermission, sendLocal, subscription };
};

// 7. EMAIL VERIFICATION
export const useEmailVerification = () => {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  useEffect(() => { setVerified(!!user?.email_confirmed_at); }, [user]);
  const resend = useCallback(async () => {
    if (!user?.email) return;
    setSending(true);
    await supabase.auth.resend({ type: "signup", email: user.email });
    setSending(false);
  }, [user]);
  return { verified, sending, resend };
};

// 8. EVENT CALENDAR VIEW
export const useEventCalendar = (events: Event[]) => {
  const [viewDate, setViewDate] = useState(new Date());
  const monthEvents = events.filter((e) => {
    const d = new Date(e.starts_at);
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  });
  const dayEvents = useCallback((date: Date) => {
    return events.filter((e) => new Date(e.starts_at).toDateString() === date.toDateString());
  }, [events]);
  const nextMonth = useCallback(() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);
  const prevMonth = useCallback(() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
  return { viewDate, monthEvents, dayEvents, nextMonth, prevMonth };
};

// 9. 2FA / MFA
export const use2FA = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkStatus = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setEnabled((data?.totp?.length || 0) > 0);
  }, []);
  const enroll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setLoading(false);
    return { qrCode: data?.totp?.qr_code, uri: data?.totp?.uri, secret: data?.totp?.secret, error };
  }, []);
  const verify = useCallback(async (factorId: string, code: string) => {
    const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
    if (!challenge) return { error: new Error("Challenge failed") };
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (!error) setEnabled(true);
    return { error };
  }, []);
  const unenroll = useCallback(async (factorId: string) => {
    await supabase.auth.mfa.unenroll({ factorId });
    setEnabled(false);
  }, []);
  return { enabled, loading, checkStatus, enroll, verify, unenroll };
};

// 10. IN-APP PURCHASES
export type PurchaseType = "boost" | "super_like" | "gift_rose" | "gift_diamond" | "gift_crown";

export interface PurchaseItem {
  type: PurchaseType;
  name: string;
  description: string;
  price_coins: number;
  icon: string;
}

export const PURCHASE_ITEMS: PurchaseItem[] = [
  { type: "boost", name: "Profile Boost", description: "Be seen by 10x more people for 30 min", price_coins: 100, icon: "🚀" },
  { type: "super_like", name: "Super Like", description: "Stand out with a special notification", price_coins: 25, icon: "⭐" },
  { type: "gift_rose", name: "Rose", description: "Send a beautiful rose", price_coins: 10, icon: "🌹" },
  { type: "gift_diamond", name: "Diamond", description: "A sparkling diamond gift", price_coins: 50, icon: "💎" },
  { type: "gift_crown", name: "Crown", description: "The ultimate gift of admiration", price_coins: 200, icon: "👑" },
];

export const useInAppPurchases = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    if (!user) return;
    supabase.from("user_coins").select("balance").eq("user_id", user.id).single()
      .then(({ data }) => setCoins((data as any)?.balance || 0));
  }, [user]);
  const purchase = useCallback(async (item: PurchaseItem, targetUserId?: string) => {
    if (!user || coins < item.price_coins) return { error: new Error("Insufficient coins") };
    const { error } = await supabase.from("purchases").insert({
      user_id: user.id, type: item.type, target_user_id: targetUserId, coins_spent: item.price_coins,
    });
    if (!error) setCoins((c) => c - item.price_coins);
    return { error };
  }, [user, coins]);
  return { coins, purchase, items: PURCHASE_ITEMS };
};
