import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// ENDPOINT
const API_MAP = {
  // PICSART
  removebg: "https://api.picsart.io/tools/1.0/removebg",
  filter: "https://api.picsart.io/tools/1.0/effects",
  cartoon: "https://api.picsart.io/tools/1.0/effects/ai",
  upscale: "https://api.picsart.io/tools/1.0/upscale",
  // AI LAB API
  hair2: "https://www.ailabapi.com/api/portrait/effects/hairstyle-editor",
  hair: "https://www.ailabapi.com/api/portrait/effects/hairstyle-editor",
  skin: "https://www.ailabapi.com/api/portrait/effects/face-beauty",
  makeup: "https://www.ailabapi.com/api/portrait/effects/face-makeup",
  light: "https://www.ailabapi.com/api/image/enhance/image-color-enhancement"
};

const HAIR_STYLE_MAP = {
  "Bangs": "101",
  "Long hair": "201",
  "Bangs with long hair": "301",
  "Medium hair increase": "401",
  "Light hair increase": "402",
  "Heavy hair increase": "403",
  "Light curling": "502",
  "Heavy curling": "503",
  "Short hair": "603",
  "Blonde": "801",
  "Straight hair": "901",
  "Oil-free hair": "1001",
  "Hairline fill": "1101",
  "Smooth hair": "1201",
  "Fill hair gap": "1301"
};
Deno.serve(async (req)=>{
  try {
    const { fitur, img_url, data = {} } = await req.json();
    if (!fitur || !img_url) {
      return new Response(JSON.stringify({
        error: "Missing parameters"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const apiUrl = API_MAP[fitur];
    if (!apiUrl) {
      return new Response(JSON.stringify({
        error: "Invalid fitur"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    let headers = {};
    let body;
    let isMultipart = false;
    switch(fitur){
      case "removebg":
        {
          headers = {
            "X-Picsart-API-Key": Deno.env.get("PICSART_API_KEY") ?? ""
          };
          const formData = new FormData();
          formData.append("image_url", img_url);
          body = formData;
          isMultipart = true;
          break;
        }
      case "filter":
        {
          headers = {
            "X-Picsart-API-Key": Deno.env.get("PICSART_API_KEY") ?? ""
          };
          const formData = new FormData();
          formData.append("image_url", img_url);
          if (data?.jenis) formData.append("effect_name", data.jenis);
          body = formData;
          isMultipart = true;
          break;
        }
      case "cartoon":
        {
          headers = {
            "X-Picsart-API-Key": Deno.env.get("PICSART_API_KEY") ?? ""
          };
          const formData = new FormData();
          formData.append("image_url", img_url);
          formData.append("effect_name", "cartoon2");
          body = formData;
          isMultipart = true;
          break;
        }
      case "upscale":
        {
          headers = {
            "X-Picsart-API-Key": Deno.env.get("PICSART_API_KEY") ?? ""
          };
          const formData = new FormData();
          formData.append("image_url", img_url);
          formData.append("upscale_factor", "2");
          body = formData;
          isMultipart = true;
          break;
        }
      case "skin":
        {
          headers = {
            "ailabapi-api-key": Deno.env.get("AILAB_API_KEY") ?? ""
          };
          const response = await fetch(img_url);
          if (!response.ok) return new Response(JSON.stringify({
            error: "Gagal download image"
          }), {
            status: 400
          });
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("image", new File([
            blob
          ], "upload.jpg", {
            type: blob.type
          }));
          formData.append("sharp", "0.5");
          formData.append("smooth", "0.5");
          formData.append("white", "0.5");
          body = formData;
          isMultipart = true;
          break;
        }
      case "hair":
        {
          headers = {
            "ailabapi-api-key": Deno.env.get("AILAB_API_KEY") ?? ""
          };
          const styleCode = HAIR_STYLE_MAP[data.style];
          if (!styleCode) return new Response(JSON.stringify({
            error: `Invalid hairstyle: ${data.style}`
          }), {
            status: 400
          });
          const response = await fetch(img_url);
          if (!response.ok) return new Response(JSON.stringify({
            error: "Gagal download image"
          }), {
            status: 400
          });
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("image_target", new File([
            blob
          ], "upload.jpg", {
            type: blob.type
          }));
          formData.append("hair_type", styleCode);
          const jobRes = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: formData
          });
          const result = await jobRes.json();
          if (!result?.data?.image) return new Response(JSON.stringify({
            error: "No base64 in response"
          }), {
            status: 500
          });
          const base64 = result.data.image;
          const binary = Uint8Array.from(atob(base64), (c)=>c.charCodeAt(0));
          const filename = `hair-${styleCode}-${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage.from("image").upload(filename, binary, {
            contentType: "image/png",
            upsert: true
          });
          if (uploadError) return new Response(JSON.stringify({
            error: uploadError.message
          }), {
            status: 500
          });
          const { data: { publicUrl } } = supabase.storage.from("image").getPublicUrl(filename);
          return new Response(JSON.stringify({
            url: publicUrl
          }), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        }
      case "makeup":
        {
          headers = {
            "ailabapi-api-key": Deno.env.get("AILAB_API_KEY") ?? ""
          };
          const response = await fetch(img_url);
          if (!response.ok) return new Response(JSON.stringify({
            error: "Gagal download image"
          }), {
            status: 400
          });
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("image", new File([
            blob
          ], "upload.jpg", {
            type: blob.type
          }));
          formData.append("resource_type", "6");
          formData.append("strength", "0.5");
          body = formData;
          isMultipart = true;
          break;
        }
      case "light":
        {
          headers = {
            "ailabapi-api-key": Deno.env.get("AILAB_API_KEY") ?? ""
          };
          const response = await fetch(img_url);
          if (!response.ok) return new Response(JSON.stringify({
            error: "Gagal download image"
          }), {
            status: 400
          });
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("image", new File([
            blob
          ], "upload.jpg", {
            type: blob.type
          }));
          formData.append("output_format", "png");
          formData.append("mode", "ln17_256");
          body = formData;
          isMultipart = true;
          break;
        }
    }
    // 🔹 Jalankan request biasa untuk fitur non-hair
    const jobRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: isMultipart ? body : JSON.stringify(body)
    });
    const contentType = jobRes.headers.get("content-type") ?? "";
    if (!jobRes.ok) return new Response(JSON.stringify({
      error: "Gagal memproses API eksternal"
    }), {
      status: jobRes.status
    });
    const blob = await jobRes.blob();
    const filename = `${fitur}-${Date.now()}.png`;
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from("image").upload(filename, buffer, {
      contentType: blob.type || "image/png",
      upsert: true
    });
    if (uploadError) return new Response(JSON.stringify({
      error: uploadError.message
    }), {
      status: 500
    });
    const { data: { publicUrl } } = supabase.storage.from("image").getPublicUrl(filename);

    return new Response(JSON.stringify({
      url: publicUrl
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("EDGE ERROR:", err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : String(err)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
