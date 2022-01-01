export enum Alpha {
  HIGH,
  MED_HIGH,
  MED_LOW,
  LOW,
  VERY_LOW,
}

export function getAlphaNumber(alpha: Alpha): number {
  switch (alpha) {
    case Alpha.HIGH:
      return 1;
    case Alpha.MED_HIGH:
      return 0.75;
    case Alpha.MED_LOW:
      return 0.65;
    case Alpha.LOW:
      return 0.45;
    case Alpha.VERY_LOW:
      return 0.35;
  }
}
