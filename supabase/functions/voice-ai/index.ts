import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing text or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lower = text.toLowerCase().trim();
    let action = "unknown";
    let parameters: Record<string, unknown> = {};
    let confidence = 0.0;

    const patterns: [RegExp, string, (m: RegExpMatchArray) => Record<string, unknown>][] = [
      [/^find (.+) nearby$/i, "find_nearby", (m) => ({ filter: m[1] })],
      [/^go to (.+)$/i, "navigate", (m) => ({ route: m[1].toLowerCase() })],
      [/^send (.+)$/i, "send_message", (m) => ({ text: m[1] })],
      [/^quick share$/i, "open_quickshare", () => ({})],
      [/^open album$/i, "open_albums", () => ({})],
      [/^show map$/i, "open_map", () => ({})],
      [/^(hey|hello|hi)$/i, "greet", () => ({})],
    ];

    for (const [regex, act, paramFn] of patterns) {
      const match = lower.match(regex);
      if (match) {
        action = act;
        parameters = paramFn(match);
        confidence = 0.95;
        break;
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    await fetch(`${supabaseUrl}/rest/v1/voice_commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        command_text: text,
        parsed_action: action,
        parameters,
        success: action !== "unknown",
        confidence,
      }),
    });

    return new Response(
      JSON.stringify({ action, parameters, confidence }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
