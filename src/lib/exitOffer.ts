export const EXIT_OFFER_KEY = "ap-exit-offer-shown";

export function canShowExitOffer(input: {
  top: number; consent: boolean; shown: boolean; dialogOpen: boolean; finePointer: boolean;
}) {
  return input.top <= 0 && input.consent && !input.shown && !input.dialogOpen && input.finePointer;
}