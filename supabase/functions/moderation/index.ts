import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const BLOCKED_PATTERNS = [
  /\b(fuck|shit|bitch|ass|dick|cunt|whore|slut)\b/i,
  /\b(kill|die|murder|suicide)\b/i,
  /https?:\/\/[^\s]+\.(exe|bat|cmd|scr|pif)/i,
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // credit cards
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b.{0,20}\b(password|pwd|pass)\b/i,
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type = "message" } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(content)) {
        return new Response(
          JSON.stringify({ allowed: false, reason: "Content violates community guidelines" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check for spam (repeated characters)
    if (/(.)\1{10,}/.test(content)) {
      return new Response(
        JSON.stringify({ allowed: false, reason: "Spam detected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ allowed: true, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
