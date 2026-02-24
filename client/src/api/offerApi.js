const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_URL = `${API_BASE_URL}/generate-offer`;

export async function generateOffer(formData) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.details?.join(", ") || body.error || "Request failed");
  }

  return res.json();
}
