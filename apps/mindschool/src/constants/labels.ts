/** Motivos de falha no envio de email devolvidos pela API nas acções de convite e palavra-passe. */
export const EMAIL_FAILURE_LABEL: Record<string, string> = {
  canal_email_nao_configurado: "o canal de email não está configurado",
  email_invalido: "o email do utilizador é inválido",
  falha_no_envio: "o envio falhou",
};

export const SUBSYSTEM_LABEL: Record<string, string> = {
  geral: "Ensino geral",
  tecnico_profissional: "Técnico-profissional",
  formacao_professores: "Formação de professores",
};

export const ALERT_TYPE_LABEL: Record<string, string> = {
  login_bruteforce: "Tentativas de entrada repetidas numa conta",
  credential_stuffing: "Muitas contas testadas a partir do mesmo IP",
  multi_school_access: "Acesso a muitas escolas em pouco tempo",
  export_off_hours: "Exportação fora do horário habitual",
  export_large_volume: "Exportação de grande volume",
};

export const OPERATION_LABEL: Record<string, string> = {
  sessions_revoked: "Sessões terminadas",
  user_blocked: "Utilizador bloqueado",
  user_unblocked: "Utilizador desbloqueado",
  mfa_reset: "Segundo factor reposto",
  password_reset_sent: "Link de nova palavra-passe enviado",
  invite_resent: "Convite reenviado",
  audit_search: "Pesquisa na auditoria global",
  impersonation_started: "Personificação iniciada",
  invite_accepted: "Convite aceite",
  password_reset: "Palavra-passe redefinida",
};

export const QUOTA_LABEL: Record<string, string> = {
  students: "Alunos",
  users: "Utilizadores internos",
  teachers: "Professores",
  sections: "Turmas",
  exports_month: "Exportações por mês",
  academic_years_active: "Anos lectivos activos",
  storage_mb: "Armazenamento (MB)",
};
