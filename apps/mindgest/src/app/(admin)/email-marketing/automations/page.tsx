import { PageWrapper, TitleList, Icon } from "@/components";

const DUNNING_STEPS = [
  {
    day: "-5 dias",
    event: "Lembrete de Renovação",
    template: "Renovação Próxima",
    status: "active" as const,
  },
  {
    day: "Vencimento",
    event: "Pagamento Devido",
    template: "Pagamento Devido",
    status: "active" as const,
  },
  {
    day: "+1 dia",
    event: "1.º Lembrete",
    template: "Primeiro Lembrete de Pagamento",
    status: "active" as const,
  },
  {
    day: "+4 dias",
    event: "2.º Lembrete",
    template: "Segundo Lembrete de Pagamento",
    status: "active" as const,
  },
  {
    day: "+7 dias",
    event: "Último Lembrete",
    template: "Último Lembrete de Renovação",
    status: "active" as const,
  },
];


const PAYMENT_STEPS = [
  { event: "Pagamento Confirmado", template: "Pagamento Confirmado", note: "Sequência de lembretes interrompida automaticamente" },
  { event: "Subscrição Renovada", template: "Subscrição Renovada", note: "Email de confirmação enviado" },
];

export default function AutomationsPage() {
  return (
    <PageWrapper subRoute="Automações" routeLabel="Email Marketing / Automações">
      <TitleList
        title="Automações de Cobrança"
        suTitle="Régua de email automático baseada no ciclo de subscrição"
      />

      <div className="space-y-8 pt-4">
        {/* Dunning Sequence */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="Zap" className="w-5 h-5 text-primary" />
              Sequência de Cobrança
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enviada automaticamente quando uma subscrição se aproxima ou passa da data de vencimento.
            </p>
          </div>
          <div className="space-y-0">
            {DUNNING_STEPS.map((step, idx) => (
              <div key={step.day} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20 mt-4 shrink-0" />
                  {idx < DUNNING_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                {/* Step Content */}
                <div className="pb-6 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md w-fit bg-primary/10 text-primary">
                      {step.day}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.event}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Template: <span className="text-foreground font-medium">{step.template}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment STOP sequence */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="CircleCheck" className="w-5 h-5 text-emerald-500" />
              Interrupção Automática — Pagamento Confirmado
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Quando um pagamento é confirmado, a sequência de cobrança é interrompida imediatamente.
            </p>
          </div>
          <div className="space-y-3">
            {PAYMENT_STEPS.map((step) => (
              <div
                key={step.event}
                className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4"
              >
                <Icon name="Check" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    {step.event}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Template: <strong>{step.template}</strong> — {step.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground flex items-start gap-3">
          <Icon name="Info" className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground block mb-1">Como funciona</strong>
            As automações são executadas pelo serviço <code className="text-xs font-mono bg-background rounded px-1 py-0.5 border border-border">DunningAutomationService</code> via Cron diário à meia-noite. Cada passo é registado em <code className="text-xs font-mono bg-background rounded px-1 py-0.5 border border-border">dunning_automation_logs</code> para evitar envios duplicados.
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
