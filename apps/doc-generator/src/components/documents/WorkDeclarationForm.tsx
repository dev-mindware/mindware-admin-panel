"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Icon,
} from "@workspace/ui";

export interface WorkDeclarationFormData {
  workerName: string;
  workerGender: "M" | "F";
  workerIdNumber: string;
  workerRole: string;
  workerDepartment: string;
  workerStatus: string;
  purpose: string;
  emissionPlace: string;
  city: string;
  emissionDate: string;
  signatoryRole: string;
  code: string;
}

interface Props {
  data: WorkDeclarationFormData;
  onChange: (field: keyof WorkDeclarationFormData, value: any) => void;
}

export function WorkDeclarationForm({ data, onChange }: Props) {
  const isMale = data.workerGender === "M";

  // Tokens com flexão de género
  const pronounTitle = isMale ? "o Sr." : "a Sra.";
  const portador = isMale ? "portador" : "portadora";
  const colaboradorCapitalized = isMale ? "O referido colaborador" : "A referida colaboradora";
  const doColaborador = isMale ? "do referido colaborador" : "da referida colaboradora";
  const oMesmo = isMale ? "o mesmo" : "a mesma";
  const interessado = isMale ? "do interessado" : "da interessada";

  return (
    <div className="space-y-6">
      {/* CARD 1: IDENTIFICAÇÃO DO COLABORADOR */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="User" size={16} className="text-primary" />
                Dados do Colaborador & Género
              </CardTitle>
              <CardDescription className="text-xs">
                Selecione o sexo e preencha os dados do colaborador para adaptar o texto automaticamente
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary px-2.5 py-0.5 w-fit">
              {data.code || "DECL-2026-001"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* SELEÇÃO DE SEXO / GÉNERO (DESTACADA) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Sexo / Género do Trabalhador *</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                (Altera automaticamente todos os pronomes e flexões no documento)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção Masculino */}
              <button
                type="button"
                onClick={() => onChange("workerGender", "M")}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isMale
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <div
                  className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isMale
                      ? "border-primary bg-primary text-white"
                      : "border-muted-foreground"
                  }`}
                >
                  {isMale && <Icon name="Check" size={12} />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Masculino</span>
                    <Badge variant={isMale ? "default" : "secondary"} className="text-[10px] py-0 px-1.5 h-4">
                      o Sr.
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    O referido colaborador • portador • o mesmo • a pedido do interessado
                  </p>
                </div>
              </button>

              {/* Opção Feminino */}
              <button
                type="button"
                onClick={() => onChange("workerGender", "F")}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  !isMale
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                    : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <div
                  className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    !isMale
                      ? "border-primary bg-primary text-white"
                      : "border-muted-foreground"
                  }`}
                >
                  {!isMale && <Icon name="Check" size={12} />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Feminino</span>
                    <Badge variant={!isMale ? "default" : "secondary"} className="text-[10px] py-0 px-1.5 h-4">
                      a Sra.
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    A referida colaboradora • portadora • a mesma • a pedido da interessada
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* GRID DE CAMPOS: NOME, BI, CARGO, DEPARTAMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Nome Completo do Colaborador *</span>
              </label>
              <Input
                placeholder="ex: Ângelo Tchiwano Domingos"
                value={data.workerName}
                onChange={(e) => onChange("workerName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>N.º do Bilhete de Identidade (B.I.)</span>
                <span className="text-[10px] text-muted-foreground">(Opcional)</span>
              </label>
              <Input
                placeholder="ex: 005829142LA042"
                value={data.workerIdNumber}
                onChange={(e) => onChange("workerIdNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Função / Cargo do Colaborador *
              </label>
              <Input
                placeholder="ex: Técnico Especialista de TI & Gestor de Sistemas"
                value={data.workerRole}
                onChange={(e) => onChange("workerRole", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Área / Departamento *
              </label>
              <Input
                placeholder="ex: Tecnologias de Informação"
                value={data.workerDepartment}
                onChange={(e) => onChange("workerDepartment", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Estado do Vínculo Profissional
            </label>
            <Input
              placeholder="ex: activo e regular"
              value={data.workerStatus}
              onChange={(e) => onChange("workerStatus", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: FINALIDADE, LOCAL E EMISSÃO */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon name="FileText" size={16} className="text-primary" />
            Finalidade, Local de Emissão & Assinatura
          </CardTitle>
          <CardDescription className="text-xs">
            Especifique o efeito para o qual a declaração é emitida e as informações de emissão
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Finalidade / Efeito da Declaração *
            </label>
            <textarea
              rows={3}
              className="w-full p-3 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
              placeholder="ex: comprovação da sua situação profissional, vínculo institucional e exercício de actividade na área de Tecnologias de Informação"
              value={data.purpose}
              onChange={(e) => onChange("purpose", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Local de Emissão
              </label>
              <Input
                placeholder="ex: Luanda, Angola"
                value={data.emissionPlace}
                onChange={(e) => onChange("emissionPlace", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Data de Emissão *
              </label>
              <Input
                placeholder="ex: 04 de Setembro de 2026"
                value={data.emissionDate}
                onChange={(e) => onChange("emissionDate", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Cargo / Assinante
              </label>
              <Input
                placeholder="ex: A DIRECÇÃO GERAL"
                value={data.signatoryRole}
                onChange={(e) => onChange("signatoryRole", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: PRÉ-VISUALIZAÇÃO DO TEXTO ADAPTADO EM TEMPO REAL */}
      <Card className="border-primary/20 bg-primary/[0.02] shadow-xs">
        <CardHeader className="pb-3 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <Icon name="Eye" size={16} />
              Pré-visualização do Texto Oficial Adaptado
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                {isMale ? "Flexão: Masculino" : "Flexão: Feminino"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4 text-xs text-muted-foreground leading-relaxed">
          <p className="p-3 rounded-lg bg-card border border-border/60">
            <strong className="text-foreground">A MINDWARE – Comércio e Serviços, Lda.</strong>, pessoa colectiva devidamente constituída e registada sob o <strong className="text-foreground">NIF 5002464497</strong>, com sede em Luanda, Angola, vem, por meio da presente declaração, confirmar que{" "}
            <span className="font-semibold text-primary">{pronounTitle}</span>{" "}
            <strong className="text-foreground">{data.workerName || "[Nome do Colaborador]"}</strong>
            {data.workerIdNumber && (
              <>
                , <span className="font-semibold text-primary">{portador}</span> do B.I. n.º <strong className="text-foreground">{data.workerIdNumber}</strong>
              </>
            )}
            , integra o quadro efectivo da empresa, encontrando-se actualmente no exercício das suas funções profissionais.
          </p>

          <p className="p-3 rounded-lg bg-card border border-border/60">
            <span className="font-semibold text-primary">{colaboradorCapitalized}</span> exerce a função de{" "}
            <strong className="text-foreground">{data.workerRole || "[Função / Cargo]"}</strong>, desempenhando funções de natureza técnica no âmbito das actividades da empresa e contribuindo para a execução e acompanhamento das suas operações na área de{" "}
            <strong className="text-foreground">{data.workerDepartment || "[Área / Departamento]"}</strong>.
          </p>

          <p className="p-3 rounded-lg bg-card border border-border/60">
            A MINDWARE confirma que o vínculo profissional{" "}
            <span className="font-semibold text-primary">{doColaborador}</span> se encontra{" "}
            <strong className="text-foreground">{data.workerStatus || "activo e regular"}</strong>, mantendo-se{" "}
            <span className="font-semibold text-primary">{oMesmo}</span> no pleno exercício das funções que lhe foram atribuídas pela empresa.
          </p>

          <p className="p-3 rounded-lg bg-card border border-border/60">
            A presente declaração é emitida a pedido{" "}
            <span className="font-semibold text-primary">{interessado}</span>, para efeitos de{" "}
            <strong className="text-foreground">{data.purpose || "[Finalidade]"}</strong>, podendo ser apresentada perante entidades públicas ou privadas que dela necessitem.
          </p>

          <div className="pt-2 text-center text-[11px] text-foreground font-medium">
            {data.city || "Luanda"}, aos {data.emissionDate || "[Data de Emissão]"}.
            <div className="mt-2 font-bold tracking-wide text-primary">
              {data.signatoryRole || "A DIRECÇÃO GERAL"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}