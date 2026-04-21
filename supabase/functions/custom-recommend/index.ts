import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interest } = await req.json();
    if (!interest || typeof interest !== "string" || interest.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid interest" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: museums } = await supabase
      .from("museums")
      .select("id,name,city,description,theme_tags,image_url,base_price_adult");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const catalogue = (museums ?? []).map((m: any) => ({
      id: m.id,
      name: m.name,
      city: m.city,
      tags: m.theme_tags,
      description: m.description.slice(0, 200),
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a museum recommendation expert. Given a user's interest and a catalogue of museums, pick the 1-3 best matches and explain warmly why. Reply in the same language as the user. Use only museum IDs from the catalogue.",
          },
          {
            role: "user",
            content: `User interest: "${interest}"\n\nCatalogue:\n${JSON.stringify(catalogue, null, 2)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_museums",
              description: "Return top museum recommendations with explanation.",
              parameters: {
                type: "object",
                properties: {
                  explanation: {
                    type: "string",
                    description: "Warm 2-3 sentence explanation of why these museums match, in the user's language.",
                  },
                  museum_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "1 to 3 museum IDs from the catalogue, ordered by best match.",
                  },
                },
                required: ["explanation", "museum_ids"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_museums" } },
      }),
    });

    if (response.status === 429)
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (response.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const args = JSON.parse(toolCall.function.arguments);
    const ids: string[] = args.museum_ids ?? [];

    const recommended = ids
      .map((id) => (museums ?? []).find((m: any) => m.id === id))
      .filter(Boolean);

    return new Response(
      JSON.stringify({ explanation: args.explanation, museums: recommended }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("custom-recommend error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
