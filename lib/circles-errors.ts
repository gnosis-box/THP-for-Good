export function humanizeCirclesError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("rejected")) {
    return "Transaction annulée dans l'hôte Circles.";
  }
  if (lower.includes("insufficient") || lower.includes("balance")) {
    return "Solde CRC insuffisant pour ce paiement (100 CRC requis).";
  }
  if (lower.includes("trust") || lower.includes("path")) {
    return "Impossible d'envoyer les CRC : établissez un lien de trust avec ce mentor, ou vérifiez votre réseau Circles.";
  }
  if (lower.includes("reverted")) {
    return "Transaction rejetée on-chain. Vérifiez le solde et le trust.";
  }
  if (lower.includes("not initialized") || lower.includes("contractrunner")) {
    return "Wallet Circles non prêt — reconnectez-vous dans l'hôte.";
  }
  if (raw.length > 160) {
    return `${raw.slice(0, 120)}…`;
  }
  return raw || "Une erreur est survenue.";
}
