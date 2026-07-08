"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { SUPPORT_WHATSAPP } from "@/config/support";
import { useAuthStore } from "@/stores/auth.store";
import toast from "react-hot-toast";
import {
  Check, Zap, Crown, Star, Lock, Unlock, Loader2,
  Package, DollarSign, FlaskConical, Bike,
  BarChart2, Brain, Gift, CreditCard, Shield, X,
  ChevronRight, MessageCircle, ArrowRight, UtensilsCrossed, ShieldCheck, LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = "BASIC" | "PRO" | "ENTERPRISE";

interface PlanPrice {
  price: number;
  label: string;
  tagline: string | null;
}

interface CatalogModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  price: number | null;
  isFree: boolean;
  benefits: string[];
  badge?: string | null;
  icon?: string;
}

interface Subscription {
  plan:               Plan;
  subscriptionStatus: string;
  dueDate:            string | null;
  modules:            { moduleSlug: string; status: string; active: boolean }[];
  planPrices?:        Record<string, PlanPrice>;
}

// ─── Função de Catálogo Local Mapeada com a sua Interface ───────────────────
const getCatalogModule = (slug: string): CatalogModule => {
  const normalizedSlug = slug.toLowerCase();

  // Lista mockada contendo as propriedades reais exigidas pelo seu tipo CatalogModule
  const modulesMock: Record<string, Partial<CatalogModule>> = {
    "pdv": { name: "PDV", description: "Frente de caixa rápido" },
    "pedidos": { name: "Pedidos", description: "Gerenciamento centralizado de pedidos" },
    "cozinha": { name: "Cozinha", description: "Painel KDS para os pizzaiolos" },
    "mesas": { name: "Mesas", description: "Controle de salão, comandas e mesas" },
    "cardapio-online": { name: "Cardápio Online", description: "Seu site próprio de delivery" },
    "cupons": { name: "Cupons", description: "Gerador de cupons de desconto" },
    "relatorios": { name: "Relatórios", description: "Métricas e faturamento em tempo real" },
    "whatsapp-ia": { name: "WhatsApp IA", description: "Atendimento automático por inteligência artificial" },
    "multiunidades": { name: "Multiunidades", description: "Gerencie franquias ou várias lojas" },
    "white-label": { name: "White Label", description: "Sua própria marca e domínio no sistema" },
  };

  const found = modulesMock[normalizedSlug];

  return {
    id: normalizedSlug,
    slug: normalizedSlug,
    name: found?.name ?? slug,
    description: found?.description ?? "Módulo do ecossistema",
    category: "geral",
    price: null,
    isFree: true,
    benefits: [],
    ...found
  };
};

// ─── Plan static config ───────────────────────────────────────────────────────

const PLAN_ORDER: Plan[] = ["BASIC", "PRO", "ENTERPRISE"];

const PLAN_STATIC: Record<Plan, {
  label: string; icon: React.ReactNode; color: string;
  border: string; bg: string; tagline: string; features: string[];
}> = {
  BASIC: {
    label: "Essencial",
    icon: <Package size={20} />,
    color: "text-green-600",
    border: "border-green-400",
    bg: "bg-green-50",
    tagline: "Para quem está começando",
    features: [
      "Cardápio digital",
      "Site próprio do restaurante",
      "Pedidos online",
      "Gestão de produtos",
      "Cadastro de clientes",
      "Controle de pedidos",
      "Frente de caixa (PDV)",
      "Controle de caixa",
      "QR Code do cardápio",
      "Relatórios básicos",
      "Taxa de entrega por bairro",
      "Cupons simples",
    ],
  },
  PRO: {
    label: "Profissional",
    icon: <Star size={20} />,
    color: "text-blue-600",
    border: "border-blue-400",
    bg: "bg-blue-50",
    tagline: "Para restaurantes em crescimento",
    features: [
      "Tudo do Essencial",
      "Gestão de entregas",
      "Painel de motoboys",
      "Controle de estoque",
      "Ficha técnica",
      "Baixa automática de ingredientes",
      "Sistema de Cozinha (KDS)",
      "Dashboard financeiro",
      "PIX automático",
      "Relatórios avançados",
      "Gestão de mesas e QR Code individual",
      "Programa de fidelidade",
      "Promoções e combos",
      "WhatsApp automático",
      "Envio do link do cardápio",
      "Mensagens automáticas de status do pedido",
      "Mensagens personalizáveis"
    ],
  },
  ENTERPRISE: {
    label: "Premium",
    icon: <Crown size={20} />,
    color: "text-purple-600",
    border: "border-purple-400",
    bg: "bg-purple-50",
    tagline: "Operação completa e automatizada",
    features: [
      "Tudo do Profissional",
      "IA completa no WhatsApp",
      "Integração iFood",
      "Integração 99 Food",
      "Automação de marketing",
      "API e Webhooks",
      "Multi-loja",
      "DRE Gerencial",
      "Rastreamento de entregadores",
      "Suporte prioritário",
    ],
  },
};

// Configuração exata dos preços passados pelo usuário
const PRICE_FALLBACK: Record<Plan, { monthly: number; annual: number }> = { 
  BASIC: { monthly: 39.90, annual: 399.90 }, 
  PRO: { monthly: 89.90, annual: 899.90 }, 
  ENTERPRISE: { monthly: 149.90, annual: 1499.90 } 
};

// ─── Módulos avulsos (estáticos) ──────────────────────────────────────────────

const ADDON_SLUGS = ["FINANCIAL", "RECIPES", "DELIVERY", "BI", "AI", "LOYALTY"];

const ADDON_ICON: Record<string, React.ReactNode> = {
  FINANCIAL: <DollarSign size={15} />,
  RECIPES:   <FlaskConical size={15} />,
  DELIVERY:  <Bike size={15} />,
  BI:        <BarChart2 size={15} />,
  AI:        <Brain size={15} />,
  LOYALTY:   <Gift size={15} />,
};

const PLAN_INCLUDES: Record<Plan, string[]> = {
  BASIC:      [],
  PRO:        ["FINANCIAL", "RECIPES", "DELIVERY"],
  ENTERPRISE: ["FINANCIAL", "RECIPES", "DELIVERY", "BI", "AI", "LOYALTY"],
};

// ─── Checkout gate plan cards ─────────────────────────────────────────────────
const CHECKOUT_PLANS = [
  {
    plan: "BASIC",
    label: "Essencial",
    color: "#16a34a",
    popular: false,
    features: [
      "Cardápio digital",
      "Pedidos online",
      "PDV",
      "Controle de caixa",
      "QR Code",
    ],
  },
  {
    plan: "PRO",
    label: "Profissional",
    color: "#2563eb",
    popular: true,
    features: [
      "Tudo do Essencial",
      "Estoque",
      "KDS",
      "PIX automático",
      "WhatsApp automático",
    ],
  },
  {
    plan: "ENTERPRISE",
    label: "Premium",
    color: "#7c3aed",
    popular: false,
    features: [
      "Tudo do Profissional",
      "IA WhatsApp",
      "iFood",
      "Multi-loja",
    ],
  },
];

export default function AssinaturaPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const companyId  = user?.companyId ?? "";
  const canEdit    = user?.role === "SUPER_ADMIN";
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const [sub,             setSub]             = useState<Subscription | null>(null);
  const [catalog,         setCatalog]         = useState<CatalogModule[]>([]);
  const [selectedModule,  setSelectedModule]  = useState<CatalogModule | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [busy,            setBusy]            = useState<Record<string, boolean>>({});
  const [companyName,     setCompanyName]     = useState<string>("");
  const [isAnnual,        setIsAnnual]        = useState<boolean>(false);

  useEffect(() => {
    if (!companyId) return;
    load();
  }, [companyId]);

  async function load() {
    setLoading(true);
    try {
      const [subRes, catRes, companyRes] = await Promise.all([
        api.get<Subscription>(`/company/${companyId}/subscription`),
        api.get<CatalogModule[]>("/company-module/catalog").catch(() => ({ data: [] })),
        api.get<{ name: string }>(`/company/${companyId}`).catch(() => ({ data: { name: "" } })),
      ]);
      const validPlans: Plan[] = ["BASIC", "PRO", "ENTERPRISE"];
      const plan = validPlans.includes(subRes.data.plan as Plan) ? subRes.data.plan : "BASIC";
      setSub({ ...subRes.data, plan });
      setCatalog(Array.isArray(catRes.data) ? catRes.data : []);
      setCompanyName(companyRes.data?.name || companyId);
    } catch {
      toast.error("Erro ao carregar assinatura");
    } finally {
      setLoading(false);
    }
  }

  async function upgradePlan(plan: Plan) {
    if (!canEdit) { toast.error("Apenas Super Admin pode alterar o plano."); return; }
    setBusy((b) => ({ ...b, [`plan-${plan}`]: true }));
    try {
      await api.patch(`/company/${companyId}/plan`, { plan, interval: isAnnual ? "YEARLY" : "MONTHLY" });
      toast.success(`Migrado para o plano ${PLAN_STATIC[plan].label}!`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erro ao atualizar plano");
    } finally {
      setBusy((b) => ({ ...b, [`plan-${plan}`]: false }));
    }
  }

  async function toggleModule(slug: string, currentlyActive: boolean) {
    if (!canEdit) { toast.error("Apenas Super Admin pode ativar/desativar módulos."); return; }
    setBusy((b) => ({ ...b, [slug]: true }));
    try {
      if (currentlyActive) {
        await api.delete(`/company-module/${companyId}/${slug.toLowerCase()}`);
        toast.success("Módulo desativado");
      } else {
        await api.post("/company-module/activate", { companyId, moduleSlug: slug.toLowerCase() });
        toast.success("Módulo ativado!");
      }
      load();
    } catch {
      toast.error("Erro ao alterar módulo");
    } finally {
      setBusy((b) => ({ ...b, [slug]: false }));
    }
  }

  async function handleCheckout(planSlug: string) {
    setCheckoutLoading(planSlug);
    try {
      toast.success(`Iniciando checkout do plano ${planSlug} (${isAnnual ? "Anual" : "Mensal"})`);
    } catch {
      toast.error("Erro ao abrir checkout");
    } finally {
      setCheckoutLoading(null);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function planPriceLabel(plan: Plan): string {
    if (isAnnual) {
      return `R$ ${PRICE_FALLBACK[plan].annual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/ano`;
    }
    return `R$ ${PRICE_FALLBACK[plan].monthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`;
  }

  function isModuleActive(slug: string): boolean {
    if (!sub) return false;
    if (PLAN_INCLUDES[sub.plan].includes(slug)) return true;
    return sub.modules.some(
      (m) => m.moduleSlug.toUpperCase() === slug && (m.status === "ACTIVE" || m.status === "TRIAL" || m.active),
    );
  }

  // ── Trava Global de Segurança para Carregamento Inicial ────────────────────
  if (loading || !sub) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-xs text-slate-400">Carregando informações da assinatura...</p>
      </div>
    );
  }

  // ── Checkout gate — mostrado quando subscriptionStatus === PENDING_PAYMENT ───
  if (sub.subscriptionStatus === "PENDING_PAYMENT") {
    const supportUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Olá! Fiz meu cadastro e gostaria de ajuda para escolher o melhor plano.")}`;
    return (
      <div className="min-h-screen bg-[#07090f] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-60 left-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[180px]" />
          <div className="absolute top-1/2 -right-40 h-[400px] w-[600px] rounded-full bg-purple-600/8 blur-[160px]" />
        </div>

        <div className="relative z-10">
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07090f]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/15 p-2 ring-1 ring-orange-500/30">
                  <UtensilsCrossed className="h-4 w-4 text-orange-400" />
                </div>
                <span className="text-base font-black tracking-tight">ZH Sistema de Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={supportUrl} target="_blank" rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10">
                  <MessageCircle className="h-3.5 w-3.5" />Falar com consultor
                </a>
                <button onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 transition hover:text-white/90">
                  <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </header>

          <section className="mx-auto max-w-5xl px-5 pb-10 pt-16 text-center sm:px-8 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-400">
              <Zap className="h-3 w-3" /> Conta criada com sucesso!
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              Escolha o plano{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">perfeito</span>{" "}
              para o seu negócio
            </h1>
            
            {/* Seletor Mensal / Anual no Checkout */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={`text-sm ${!isAnnual ? "text-white font-bold" : "text-white/50"}`}>Mensal</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 bg-white/10 rounded-full transition-colors duration-200 p-0.5 focus:outline-none ring-1 ring-white/20"
              >
                <div className={`w-5 h-5 bg-orange-500 rounded-full transition-transform duration-200 ${isAnnual ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm flex items-center gap-1.5 ${isAnnual ? "text-orange-400 font-bold" : "text-white/50"}`}>
                Anual <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 font-extrabold">Ganhe 2 meses!</span>
              </span>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {CHECKOUT_PLANS.map((p) => {
                const currentPrice = isAnnual ? PRICE_FALLBACK[p.plan].annual : PRICE_FALLBACK[p.plan].monthly;
                return (
                  <article
                    key={p.plan}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0e18] transition-all duration-300 hover:-translate-y-1"
                    style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px -20px ${p.color}33` }}
                  >
                    {p.popular && (
                      <div className="absolute top-0 inset-x-0 py-1.5 text-center text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: p.color }}>
                        Mais vendido ⭐
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.color}88, transparent 70%)` }} aria-hidden />
                    <div className={`relative flex flex-1 flex-col p-7 ${p.popular ? "pt-10" : ""}`}>
                      <span className="inline-block self-start rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: p.color, backgroundColor: `${p.color}22`, border: `1px solid ${p.color}44` }}>
                        {p.label}
                      </span>
                      <div className="flex flex-col mb-6">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-black">R$ {currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span className="text-white/35 text-sm pb-1">{isAnnual ? "/ano" : "/mês"}</span>
                        </div>
                      </div>
                      <ul className="space-y-2.5 flex-1 mb-7">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 text-sm text-white/70">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${p.color}22` }}>
                              <Check className="h-3 w-3" style={{ color: p.color }} strokeWidth={3} />
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleCheckout(p.plan)}
                        disabled={checkoutLoading !== null}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: p.color, boxShadow: `0 8px 24px -8px ${p.color}bb, inset 0 1px 0 rgba(255,255,255,0.15)` }}
                      >
                        {checkoutLoading === p.plan ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Abrindo pagamento…</>
                        ) : (
                          <>Contratar {p.label} <ArrowRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Benefícios Globais Solicitados */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm border-t border-white/5 pt-8">
              <span className="flex items-center gap-2 text-white/70"><ShieldCheck className="h-5 w-5 text-green-400" /> 7 dias de teste grátis</span>
              <span className="flex items-center gap-2 text-white/70"><ShieldCheck className="h-5 w-5 text-green-400" /> Sem taxa por pedido</span>
              <span className="flex items-center gap-2 text-white/70"><ShieldCheck className="h-5 w-5 text-green-400" /> Cancelamento a qualquer momento</span>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const currentIdx = PLAN_ORDER.indexOf(sub.plan);
  const activeStatic = PLAN_STATIC[sub.plan] || PLAN_STATIC.BASIC;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Assinatura</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie seu plano e recursos contratados</p>
            {/* Mantém apenas o aviso visual, mas sem bloquear a ação do clique do usuário abaixo */}
            {!canEdit && (
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Shield size={11} /> Modo de Demonstração — Ações de alteração liberadas para teste
              </span>
            )}
          </div>

          {/* Seletor Mensal / Anual do Painel Geral */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl self-start md:self-center">
            <button 
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isAnnual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Mensal
            </button>
            <button 
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${isAnnual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Anual 
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-extrabold">2 meses grátis!</span>
            </button>
          </div>
        </div>

        {/* Plano atual */}
        <div className={`rounded-2xl border-2 p-5 mb-8 ${activeStatic.border} ${activeStatic.bg}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm ${activeStatic.color}`}>
                {activeStatic.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plano atual</p>
                <p className={`text-xl font-black ${activeStatic.color}`}>
                  {sub.planPrices?.[sub.plan]?.label ?? activeStatic.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                sub.subscriptionStatus === "ACTIVE"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-600 border-red-200"
              }`}>
                {sub.subscriptionStatus === "ACTIVE" ? "Ativo" : sub.subscriptionStatus}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
                {planPriceLabel(sub.plan)}
              </span>
              {sub.dueDate && (
                <span className="text-xs text-gray-500">
                  Vence em: {new Date(sub.dueDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        </div>

{/* Cards de plano */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
  {PLAN_ORDER.map((plan, idx) => {
    const cfg        = PLAN_STATIC[plan];
    const isCurrent  = sub.plan === plan;
    const isUpgrade  = idx > currentIdx;
    const isBusy     = !!busy[`plan-${plan}`];

    return (
      <div
        key={plan}
        className={`rounded-2xl border-2 p-5 flex flex-col transition-shadow ${
          isCurrent
            ? `${cfg.border} ${cfg.bg} shadow-md`
            : "border-gray-200 bg-white hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? `${cfg.bg} ${cfg.color}` : "bg-gray-100 text-gray-500"}`}>
            {cfg.icon}
          </div>
          <div>
            <h3 className={`font-black text-base ${isCurrent ? cfg.color : "text-gray-700"}`}>
              {sub.planPrices?.[plan]?.label ?? cfg.label}
              {plan === "PRO" && <span className="text-[10px] bg-blue-100 text-blue-700 ml-1.5 px-1.5 py-0.5 rounded-md font-bold">Mais vendido ⭐</span>}
            </h3>
            <p className="text-xs text-gray-400">
              {sub.planPrices?.[plan]?.tagline ?? cfg.tagline}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-black text-xl text-gray-900">{planPriceLabel(plan)}</p>
        </div>

        <ul className="space-y-1.5 flex-1 mb-5">
          {cfg.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-gray-600 leading-tight">
              <Check size={13} className={`mt-0.5 shrink-0 ${isCurrent ? "text-green-500" : "text-gray-300"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <div className={`text-center text-xs font-black py-2 rounded-xl ${cfg.color} ${cfg.bg}`}>
            Plano atual
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // Mapeia o plano técnico para o nome amigável de exibição
              const planNames: Record<Plan, string> = {
                BASIC: "Essencial",
                PRO: "Profissional",
                ENTERPRISE: "Premium",
              };

              const chosenPlanName = planNames[plan] || plan;
              
              // ADICIONADO O 55 (BRASIL) ANTES DO DDD E NÚMERO
              const phoneNumber = "5551997195875"; 
              const message = encodeURIComponent(`Olá, gostaria de mudar para o plano ${chosenPlanName}`);
              
              toast.success(`Redirecionando para o suporte (${chosenPlanName})...`);
              
              // Abre o link correto do WhatsApp
              window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
            }}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer pointer-events-auto ${
              isUpgrade
                ? plan === "ENTERPRISE" 
                  ? "bg-purple-600 hover:bg-purple-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-gray-500 border border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {isUpgrade && <Zap size={14} />}
            Migrar para {cfg.label}
          </button>
        )}
      </div>
    );
  })}
</div>
        
{/* Recursos Avulsos */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-black text-gray-900">Módulos Avulsos</h2>
            <span className="text-xs text-gray-400 font-medium">— clique para ver detalhes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADDON_SLUGS.map((slug) => {
              const active         = isModuleActive(slug);
              // Proteção caso o plano em sub.plan não exista em PLAN_INCLUDES
              const includedByPlan = PLAN_INCLUDES[sub?.plan]?.includes(slug) ?? false;
              const isBusy         = !!busy[slug];
              
              // Evita quebra se getCatalogModule não for uma função carregada
              const catMod         = typeof getCatalogModule === 'function' ? getCatalogModule(slug) : null;
              const label          = catMod?.name ?? slug;

              return (
                <div
                  key={slug}
                  className={`rounded-xl border p-4 flex items-center gap-3 transition cursor-pointer hover:shadow-sm ${
                    active ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => {
                    if (catMod) {
                      setSelectedModule(catMod);
                    }
                  }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {ADDON_ICON[slug] ?? <span className="text-xs">📦</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{label}</p>
                    <p className="text-xs text-gray-400">
                      {includedByPlan ? "Incluído no plano" : "Consultar"}
                    </p>
                  </div>

                 <div className="flex items-center gap-1.5 shrink-0">
                    {includedByPlan ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <Shield size={13} /> Incluído
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleModule(slug, active); }}
                        disabled={isBusy || !canEdit}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                          active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : active ? (
                          <><Unlock size={12} /> Ativo</>
                        ) : (
                          <><Lock size={12} /> Ativar</>
                        )}
                      </button>
                    )}
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefícios e rodapé informativo no painel interno */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Compromisso FoodSaaS</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 7 dias de teste totalmente grátis</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Sem taxas ocultas e zero comissão por pedido</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Cancelamento livre a qualquer momento sem burocracia</li>
            </ul>
          </div>
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <CreditCard size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Ao mudar ou realizar upgrade de plano, todas as configurações, produtos e históricos da sua loja permanecem intactos. A liberação de novas funcionalidades é automática.
            </p>
          </div>
        </div>

      </div>

      {/* ── Modal de detalhes do módulo ────────────────────────────────────── */}
      {selectedModule && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModule(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {ADDON_ICON[selectedModule.slug.toUpperCase()] ?? <Package size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900">{selectedModule.name}</h3>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {selectedModule.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {selectedModule.longDescription || selectedModule.description}
              </p>

              {Array.isArray(selectedModule.benefits) && selectedModule.benefits.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                    O que está incluído
                  </p>
                  <ul className="space-y-2">
                    {selectedModule.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Módulo Adicional</p>
                  <p className="font-black text-sm text-gray-900">
                    {selectedModule.isFree ? "Incluído no plano" : "Consulte disponibilidade"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
              {canEdit && !PLAN_INCLUDES[sub.plan].includes(selectedModule.slug.toUpperCase()) && (
                <button
                  onClick={() => {
                    const active = isModuleActive(selectedModule.slug.toUpperCase());
                    toggleModule(selectedModule.slug.toUpperCase(), active);
                    setSelectedModule(null);
                  }}
                  disabled={!!busy[selectedModule.slug.toUpperCase()]}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 ${
                    isModuleActive(selectedModule.slug.toUpperCase())
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-primary text-white hover:opacity-90"
                  }`}
                >
                  {isModuleActive(selectedModule.slug.toUpperCase()) ? "Desativar módulo" : "Ativar módulo"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}