import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown, Clock3, Heart, Menu, Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import productImage from "@/assets/arbutin-cream.png.asset.json";
import productVideo from "@/assets/arbutin-video.mp4.asset.json";

const price = 897;
const previousPrice = 1497;
const benefits = [
  "Ajuda a melhorar a aparência da pele",
  "Contribui para uma aparência mais uniforme",
  "Ajuda a deixar a pele com aparência mais luminosa",
  "Prático para complementar a rotina de cuidados",
  "Ideal para quem procura cuidados direcionados para a aparência da pele",
];
const audience = [
  "Procura complementar a rotina de cuidados faciais",
  "Deseja uma pele com aparência mais uniforme",
  "Procura melhorar a aparência da luminosidade da pele",
  "Gosta de produtos práticos para skincare",
];
const deliveryOptions = ["Qualquer horário (Mais Rápido)", "Manhã (8h às 12h)", "Tarde"] as const;
const formatPrice = (amount: number) => new Intl.NumberFormat("pt-MZ").format(amount) + " MZN";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arbutin 7.0 + TXA 4.0 Cream | Drop Moz" },
      { name: "description", content: "Conheça o Arbutin 7.0 + TXA 4.0 Cream, cuidado facial para a sua rotina. Peça por 897 MZN e pague na entrega. Entrega grátis na cidade de Maputo e Matola." },
      { property: "og:title", content: "Arbutin 7.0 + TXA 4.0 Cream | Drop Moz" },
      { property: "og:description", content: "Cuidado facial para uma pele com aparência mais uniforme e luminosa. 897 MZN, pagamento na entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function useCountdown() {
  const [remaining, setRemaining] = useState(25 * 60);
  useEffect(() => {
    const key = "dropmoz-arbutin-offer-end";
    const stored = Number(window.localStorage.getItem(key));
    const end = stored > 0 ? stored : Date.now() + 25 * 60 * 1000;
    if (!stored) window.localStorage.setItem(key, String(end));
    const tick = () => setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
}

function Index() {
  const countdown = useCountdown();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const openCheckout = () => { setError(""); setCheckoutOpen(true); };

  useEffect(() => {
    if (!checkoutOpen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setCheckoutOpen(false); };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onEscape); document.body.style.overflow = ""; };
  }, [checkoutOpen]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const deliveryTime = String(form.get("deliveryTime") ?? "");
    const notes = String(form.get("notes") ?? "").trim();
    if (fullName.length < 2 || phone.replace(/\D/g, "").length < 8 || address.length < 5 || city.length < 2) {
      setError("Confira o nome, telefone, endereço e localidade antes de continuar.");
      setPending(false);
      return;
    }
    const { data, error: saveError } = await supabase.from("orders").insert({
      full_name: fullName, phone, address, city, quantity, delivery_time: deliveryTime, notes,
    }).select("id").single();
    if (saveError || !data) {
      // Orders are intentionally write-only for visitors: a successful insert cannot be read back.
      // The insert below uses a separate request with no returning representation.
      setError("Não foi possível enviar o pedido. Tente novamente.");
    } else {
      setOrderId(data.id);
    }
    setPending(false);
  }

  return (
    <main className="overflow-x-hidden pb-28 md:pb-24">
      <div className="bg-deep px-4 py-2.5 text-center text-[11px] font-bold leading-snug text-primary-foreground sm:text-xs">
        🚚 ENTREGA GRÁTIS PARA CIDADE DE MAPUTO E MATOLA • PAGUE NA ENTREGA
      </div>
      <header className="border-b border-line bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:px-10">
          <a href="#inicio" className="min-w-0 text-xl font-black tracking-normal text-foreground sm:text-2xl" aria-label="Drop Moz, início">DROP<span className="text-primary">MOZ.</span></a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex" aria-label="Navegação principal">
            <a className="hover:text-primary" href="#beneficios">Benefícios</a><a className="hover:text-primary" href="#produto">O produto</a><a className="hover:text-primary" href="#video">Vídeo</a><a className="hover:text-primary" href="#duvidas">Dúvidas</a>
          </nav>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav className="grid gap-1 border-t border-line px-5 py-3 text-sm font-semibold md:hidden" aria-label="Navegação móvel">{[["Benefícios", "#beneficios"], ["O produto", "#produto"], ["Vídeo", "#video"], ["Dúvidas", "#duvidas"]].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-2">{label}</a>)}</nav>}
      </header>

      <section id="inicio" className="bg-blush">
        <div className="mx-auto grid max-w-7xl items-center gap-0 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:px-10">
          <div className="px-6 pb-6 pt-9 sm:px-10 lg:order-1 lg:px-0 lg:py-20">
            <span className="inline-flex items-center gap-2 border border-primary/20 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary"><Sparkles className="size-3" /> Cuidado facial</span>
            <h1 className="mt-5 max-w-xl font-display text-[38px] font-bold leading-[1.07] text-foreground sm:text-5xl lg:text-[64px]">Pele com aparência mais <span className="text-primary">uniforme e luminosa.</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">Conheça o <strong className="font-semibold text-foreground">Arbutin 7.0 + TXA 4.0 Cream</strong>, um creme facial pensado para complementar a sua rotina de cuidados e ajudar a melhorar a aparência da pele.</p>
            <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-1 border-t border-line pt-5">
              <div><p className="text-xs font-semibold uppercase text-muted-foreground">De <s>{formatPrice(previousPrice)}</s></p><p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-primary">Por apenas</p><p className="text-[43px] font-black leading-none text-foreground sm:text-5xl">{formatPrice(price)}</p></div>
              <span className="mb-1 bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Oferta especial</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-foreground sm:text-sm"><span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Pagamento na entrega</span><span className="inline-flex items-center gap-2"><Truck className="size-4 text-primary" /> Entrega grátis para cidade de Maputo e Matola</span></div>
          </div>
          <div className="relative h-[390px] w-full overflow-hidden sm:h-[520px] lg:order-2 lg:h-[680px]">
            <img src={productImage.url} alt="Mulher aplicando Arbutin 7.0 + TXA 4.0 Cream e mostrando a embalagem original" fetchPriority="high" className="h-full w-full object-cover object-[center_39%]" />
            <div className="absolute bottom-4 left-4 bg-background/95 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground shadow-sm sm:bottom-6 sm:left-6">Arbutin 7.0 + TXA 4.0 Cream <span className="text-primary">· 50 g</span></div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background px-6 py-8 sm:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-4 md:grid-cols-[1fr_auto_auto] md:gap-10">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Oferta especial</p><h2 className="mt-1 text-lg font-bold sm:text-xl">O seu cuidado facial começa aqui.</h2></div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground"><Clock3 className="size-5 text-primary" /><span>Oferta especial termina em: <strong className="font-mono text-lg text-foreground" aria-live="off">{countdown}</strong></span></div>
          <span className="w-fit border border-primary/25 bg-blush px-3 py-2 text-xs font-bold text-primary">Restam apenas 9 unidades</span>
        </div>
      </section>

      <section id="beneficios" className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-6xl"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Pequenos cuidados, todos os dias</p><h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Por que incluir o Arbutin 7.0 + TXA 4.0 Cream na sua rotina?</h2>
          <div className="mt-10 grid gap-0 border-y border-line sm:grid-cols-2 lg:grid-cols-3">{benefits.map((benefit, index) => <div key={benefit} className="flex min-h-28 items-start gap-4 border-b border-line px-1 py-6 sm:px-5"><span className="text-sm font-bold text-primary">0{index + 1}</span><p className="max-w-xs text-base font-medium leading-snug">{benefit}</p></div>)}</div>
        </div>
      </section>

      <section id="produto" className="bg-deep px-6 py-16 text-primary-foreground sm:px-10 sm:py-24"><div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-20"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/65">Conheça o produto</p><h2 className="mt-4 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">Arbutin 7.0 + TXA 4.0 Cream.</h2><p className="mt-5 max-w-md text-sm leading-7 text-primary-foreground/75 sm:text-base">Um creme facial de 50 g desenvolvido para complementar a rotina de cuidados da pele e ajudar a melhorar a aparência de uniformidade e luminosidade.</p></div><div className="self-center"><div className="grid grid-cols-2 gap-3"><div className="border border-primary-foreground/20 p-5 sm:p-7"><span className="text-3xl font-black sm:text-4xl">7.0</span><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">Arbutin</p></div><div className="border border-primary-foreground/20 p-5 sm:p-7"><span className="text-3xl font-black sm:text-4xl">4.0</span><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">TXA</p></div></div><p className="mt-5 text-sm leading-6 text-primary-foreground/75">Uma combinação de ativos pensada para complementar a rotina de cuidados da pele e ajudar na aparência mais uniforme e luminosa.</p></div></div></section>

      <section id="video" className="bg-secondary px-6 py-16 sm:px-10 sm:py-24"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-20"><div className="md:order-2"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Na rotina real</p><h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Veja o produto de perto.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">Um momento de cuidado para incorporar à sua rotina. Assista ao vídeo e conheça a embalagem e a textura do creme.</p></div><div className="mx-auto w-full max-w-sm overflow-hidden bg-deep md:order-1"><video src={productVideo.url} controls playsInline preload="none" poster={productImage.url} className="aspect-[9/16] w-full object-cover" aria-label="Vídeo do Arbutin 7.0 + TXA 4.0 Cream" /></div></div></section>

      <section className="px-6 py-16 sm:px-10 sm:py-24"><div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-20"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Para o dia a dia</p><h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Sua pele merece cuidados especiais todos os dias.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">A rotina diária e diversos fatores do ambiente podem fazer com que a pele apresente uma aparência menos uniforme e luminosa. O Arbutin 7.0 + TXA 4.0 Cream pode ser incorporado à sua rotina de cuidados para ajudar a melhorar a aparência da pele.</p></div><div className="border-l-2 border-primary pl-6"><h3 className="text-lg font-bold">Ideal para quem:</h3><ul className="mt-5 space-y-4">{audience.map(item => <li key={item} className="flex items-start gap-3 text-sm leading-6"><Check className="mt-1 size-4 shrink-0 text-primary" />{item}</li>)}</ul></div></div></section>

      <section id="duvidas" className="border-t border-line bg-blush px-6 py-16 sm:px-10 sm:py-20"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Informações úteis</p><h2 className="mt-3 text-3xl font-bold">Antes de pedir</h2><div className="mt-8 grid gap-3 md:grid-cols-3"><details className="group border border-line bg-background p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Como usar? <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-6 text-muted-foreground">Utilize o produto de acordo com as instruções presentes na embalagem.</p></details><details className="group border border-line bg-background p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Como funciona o pagamento? <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-6 text-muted-foreground">O pagamento é feito na entrega.</p></details><details className="group border border-line bg-background p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Onde há entrega grátis? <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="mt-4 text-sm leading-6 text-muted-foreground">A entrega grátis aplica-se somente à cidade de Maputo e Matola. Para outras localidades, as condições de entrega devem ser confirmadas antes do pedido.</p></details></div></div></section>
      <footer className="border-t border-line px-6 py-8 text-center text-xs text-muted-foreground"><strong className="text-foreground">DROP<span className="text-primary">MOZ.</span></strong><p className="mt-2">Arbutin 7.0 + TXA 4.0 Cream · Cuidado facial</p></footer>

      <div className="fixed bottom-0 right-0 z-30 w-full border-t border-line bg-background/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_-20px_var(--foreground)] backdrop-blur-md sm:bottom-5 sm:right-5 sm:w-auto sm:border sm:p-2">
        <Button size="lg" onClick={openCheckout} className="h-13 w-full gap-3 rounded-sm bg-primary px-6 text-sm font-extrabold uppercase tracking-[0.05em] text-primary-foreground shadow-lg hover:bg-primary/90 sm:w-auto"><ShoppingBag className="size-5" /> Pedir agora <ArrowRight className="size-4" /></Button>
      </div>

      {checkoutOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep/70 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="checkout-title" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-background shadow-2xl sm:max-h-[90vh] sm:rounded-md">
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-line bg-background px-5 py-4 sm:px-7"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Drop Moz</p><h2 id="checkout-title" className="truncate text-xl font-bold">{orderId ? "Pedido recebido" : "Finalize seu pedido"}</h2></div><Button variant="ghost" size="icon" className="shrink-0" aria-label="Fechar" onClick={() => setCheckoutOpen(false)}><X /></Button></div>
          {orderId ? <div className="px-6 py-12 text-center sm:px-8"><div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blush text-primary"><Check className="size-7" /></div><h3 className="mt-5 text-2xl font-bold">Pedido enviado com sucesso!</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Recebemos o seu pedido. O pagamento será feito na entrega.</p><p className="mt-4 text-xs text-muted-foreground">Referência: {orderId.slice(0, 8).toUpperCase()}</p><Button className="mt-7 h-11 px-8" onClick={() => setCheckoutOpen(false)}>Continuar</Button></div> : <form onSubmit={submitOrder} className="space-y-5 px-5 py-6 sm:px-7">
            <div className="flex items-center justify-between border-b border-line pb-4"><div><p className="text-sm font-bold">Arbutin 7.0 + TXA 4.0 Cream</p><p className="text-xs text-muted-foreground">50 g · Pagamento na entrega</p></div><strong className="text-lg">{formatPrice(price * quantity)}</strong></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold">Nome completo <input name="fullName" autoComplete="name" required minLength={2} maxLength={120} placeholder="O seu nome" className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label><label className="block text-xs font-bold">Telefone <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required minLength={8} maxLength={30} placeholder="O seu número" className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label></div>
            <label className="block text-xs font-bold">Endereço <input name="address" autoComplete="street-address" required minLength={5} maxLength={300} placeholder="Rua, casa, bairro" className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label>
            <label className="block text-xs font-bold">Cidade/Localidade <input name="city" autoComplete="address-level2" required minLength={2} maxLength={100} placeholder="Ex.: Maputo, Matola" className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><div><span className="text-xs font-bold">Quantidade</span><div className="mt-2 inline-flex h-11 items-center border border-input"><Button type="button" variant="ghost" size="icon" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="size-4" /></Button><span className="w-10 text-center text-sm font-semibold">{quantity}</span><Button type="button" variant="ghost" size="icon" aria-label="Aumentar quantidade" disabled={quantity >= 9} onClick={() => setQuantity(Math.min(9, quantity + 1))}><Plus className="size-4" /></Button></div></div><label className="block text-xs font-bold">Horário de entrega <select name="deliveryTime" className="mt-2 h-11 w-full rounded-sm border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary">{deliveryOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label></div>
            <label className="block text-xs font-bold">Observações <span className="font-normal text-muted-foreground">(opcional)</span><textarea name="notes" rows={2} maxLength={1000} placeholder="Referência ou instruções para a entrega" className="mt-2 w-full resize-y rounded-sm border border-input bg-background p-3 text-sm font-normal outline-none focus:border-primary" /></label>
            <p className="text-xs leading-5 text-muted-foreground">Entrega grátis somente na cidade de Maputo e Matola. Para outras localidades, confirme as condições de entrega antes de concluir.</p>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-sm bg-primary text-sm font-extrabold text-primary-foreground hover:bg-primary/90">{pending ? "A enviar..." : `Confirmar pedido · ${formatPrice(price * quantity)}`}</Button>
          </form>}
        </div>
      </div>}
    </main>
  );
}
