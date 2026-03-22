const SITE = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";

const DEALS = [
  { flag: "🇹🇭", from: "Yangon", to: "Bangkok",      code: "RGN-BKK", price: 38  },
  { flag: "🇸🇬", from: "Yangon", to: "Singapore",    code: "RGN-SIN", price: 89  },
  { flag: "🇹🇭", from: "Yangon", to: "Chiang Mai",   code: "RGN-CNX", price: 62  },
  { flag: "🇲🇾", from: "Yangon", to: "Kuala Lumpur", code: "RGN-KUL", price: 95  },
  { flag: "🇭🇰", from: "Yangon", to: "Hong Kong",    code: "RGN-HKG", price: 112 },
];

function buildDealRows(): string {
  return DEALS.map((d) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="font-size:20px;width:36px;vertical-align:middle;">${d.flag}</td>
          <td style="vertical-align:middle;">
            <span style="font-weight:700;color:#1e293b;font-size:14px;">${d.from} → ${d.to}</span><br/>
            <span style="font-size:12px;color:#94a3b8;">${d.code}</span>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="font-size:11px;color:#94a3b8;text-decoration:line-through;">$${Math.round(d.price * 1.65)}</span><br/>
            <span style="font-size:18px;font-weight:800;color:#16a34a;">$${d.price}</span>
          </td>
        </tr></table>
      </td>
    </tr>`).join("");
}

export function buildWelcomeEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to GoTravel Asia</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#180840 0%,#2D0558 50%,#5B0EA6 100%);padding:40px 32px 32px;text-align:center;">
  <div style="font-size:32px;margin-bottom:8px;">✈️</div>
  <h1 style="color:#F5C518;font-size:26px;font-weight:900;margin:0 0 8px;">GoTravel Asia</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Your flight deal alerts are ready</p>
</td></tr>

<tr><td style="padding:32px 32px 16px;">
  <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 12px;">Welcome aboard! 🎉</h2>
  <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">
    You're now signed up for <strong style="color:#1e293b;">24/7 price monitoring</strong> across Southeast Asia's best routes.
  </p>
</td></tr>

<tr><td style="padding:0 32px 24px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border-radius:12px;">
    <tr>
      <td style="padding:16px;text-align:center;width:33%;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">50+</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Routes</div>
      </td>
      <td style="padding:16px;text-align:center;width:33%;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">$54</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Avg Saved</div>
      </td>
      <td style="padding:16px;text-align:center;width:33%;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">24/7</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Monitoring</div>
      </td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:0 32px 8px;">
  <h3 style="color:#1e293b;font-size:16px;font-weight:800;margin:0;">🔥 Today's Best Deals</h3>
</td></tr>

<tr><td style="padding:0 32px 24px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">
    ${buildDealRows()}
  </table>
</td></tr>

<tr><td style="padding:0 32px 32px;text-align:center;">
  <a href="${SITE}" style="display:inline-block;background:linear-gradient(135deg,#F5C518 0%,#F59E0B 100%);color:#2D0558;font-size:16px;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;">
    Search Flights Now →
  </a>
</td></tr>

<tr><td style="padding:24px 32px;background:#fefce8;border-top:1px solid #fef08a;">
  <h4 style="color:#854d0e;font-size:13px;font-weight:700;margin:0 0 12px;">⚡ How Price Alerts Work</h4>
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">1️⃣ Search any route on GoTravel Asia</td></tr>
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">2️⃣ We monitor prices 24/7 automatically</td></tr>
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">3️⃣ Get notified instantly when prices drop</td></tr>
  </table>
</td></tr>

<tr><td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;line-height:1.6;">
    Sent to <strong>${email}</strong> via
    <a href="${SITE}" style="color:#5B0EA6;text-decoration:none;">GoTravel Asia</a>.
  </p>
  <p style="color:#cbd5e1;font-size:10px;margin:0;">Reply to unsubscribe. No spam, ever. 💜</p>
</td></tr>

</table></td></tr></table>
</body></html>`;
}
