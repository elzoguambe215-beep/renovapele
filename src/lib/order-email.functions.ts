import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PRODUCT = "TOSOWOONG Arbutin 7.0 + TXA 4.0 Cream";
const UNIT_PRICE = 897;

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  quantity: z.number().int().min(1).max(9),
  deliveryTime: z.enum(["Qualquer horário (Mais Rápido)", "Manhã (8h às 12h)", "Tarde"]),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const sendOrderEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env['RESEND_API_KEY'];
    const to = process.env['ORDER_NOTIFY_EMAIL'];
    const from = process.env['RESEND_FROM_EMAIL'] || "Pedidos <onboarding@resend.dev>";
    if (!apiKey || !to) {
      console.error("Order email not configured: missing RESEND_API_KEY or ORDER_NOTIFY_EMAIL");
      return { ok: false as const };
    }
    const total = new Intl.NumberFormat("pt-MZ").format(UNIT_PRICE * data.quantity) + " MZN";
    const rows: [string, string][] = [
      ["Produto", PRODUCT],
      ["Nome completo", data.fullName],
      ["Telefone", data.phone],
      ["Cidade / Localidade", data.city],
      ["Quantidade", String(data.quantity)],
      ["Preço / Total", total],
      ["Horário de entrega", data.deliveryTime],
      ["Local de entrega", data.address],
    ];
    const html = `<h2>NOVO PEDIDO</h2>${rows.map(([k, v]) => `<p><strong>${k}:</strong><br>${esc(v)}</p>`).join("")}`;
    const text = `NOVO PEDIDO\n\n${rows.map(([k, v]) => `${k}:\n${v}`).join("\n\n")}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((e) => e.trim()), subject: `🛒 Novo pedido - ${PRODUCT}`, html, text }),
    });
    if (!res.ok) {
      console.error(`Resend error [${res.status}]: ${await res.text()}`);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
