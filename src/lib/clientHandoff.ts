export type HandoffRecipient = "Aivaras" | "Paulina";

export function createClientHandoff(recipient: HandoffRecipient) {
  return {
    patch: { assigned_to: recipient, next_action: "Perskambinti – kolegai neatsiliepė" },
    comment: `Neatsiliepė – prašau perskambinti. Perduota: ${recipient}.`,
  };
}