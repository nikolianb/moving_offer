const API_URL = "/generate-offer";

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
