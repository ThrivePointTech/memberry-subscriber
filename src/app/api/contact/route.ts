import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, phone, business, city } = await req.json();

  if (!name || !phone || !business) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Memberry Website <noreply@getmemberry.com>",
    to: "getmemberry@gmail.com",
    subject: `Demo Request — ${business}`,
    text: `Pangalan: ${name}\nCell: ${phone}\nShop: ${business}\nCity: ${city || "—"}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#142F2D;margin-bottom:16px">Demo Request</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 0;color:#5A6B69;width:120px">Pangalan</td><td style="padding:8px 0;font-weight:600;color:#142F2D">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#5A6B69">Cell</td><td style="padding:8px 0;font-weight:600;color:#142F2D">${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#5A6B69">Shop</td><td style="padding:8px 0;font-weight:600;color:#142F2D">${business}</td></tr>
          <tr><td style="padding:8px 0;color:#5A6B69">City</td><td style="padding:8px 0;font-weight:600;color:#142F2D">${city || "—"}</td></tr>
        </table>
      </div>
    `,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
