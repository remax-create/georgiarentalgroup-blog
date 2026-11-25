// When the "Get my Analysis" form gets a real (non-spam) submission,
// pass it to Sandra's Google Apps Script, which emails her and texts her cell.
export default {
  async formSubmitted(event: { data?: Record<string, string> }) {
    const d = (event.data || {}) as Record<string, string>;
    if (!d.property_address) return; // only the rent analysis form
    const url = Netlify.env.get("GRG_ALERT_URL");
    const secret = Netlify.env.get("GRG_ALERT_SECRET");
    if (!url || !secret) {
      console.error("GRG_ALERT_URL or GRG_ALERT_SECRET is not set");
      return;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, ...d }),
      redirect: "follow",
    });
    console.log("Alert sent", res.status);
  },
};
