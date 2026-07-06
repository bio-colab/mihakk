// مصادر مختارة من البحث المرفق (تظهر في صفحة المنهجية).
export interface Reference {
  n: number;
  cite: string;
  url?: string;
}

export const REFERENCES: Reference[] = [
  {
    n: 1,
    cite: 'Dathathri, S. et al. "Scalable watermarking for identifying LLM outputs." Nature 634, 818–823 (2024). [SynthID-Text]',
    url: 'https://www.nature.com/articles/s41586-024-08025-4',
  },
  {
    n: 8,
    cite: 'Mitchell, E. et al. "DetectGPT: Zero-shot Machine-Generated Text Detection using Probability Curvature." ICML 2023.',
    url: 'https://arxiv.org/abs/2301.11305',
  },
  {
    n: 9,
    cite: 'Bao, G. et al. "Fast-DetectGPT: Efficient Zero-Shot Detection via Conditional Probability Curvature." ICLR 2024.',
    url: 'https://arxiv.org/abs/2310.05130',
  },
  {
    n: 11,
    cite: 'Sadasivan, V. S. et al. "Can AI-Generated Text be Reliably Detected?" 2023. [recursive paraphrasing + impossibility]',
    url: 'https://arxiv.org/abs/2303.11156',
  },
  {
    n: 12,
    cite: 'Jovanović, N. et al. "Watermark Stealing in Large Language Models." ICML 2024.',
    url: 'https://arxiv.org/abs/2402.19361',
  },
  {
    n: 14,
    cite: 'Liang, W. et al. "GPT detectors are biased against non-native English writers." Patterns 4, 100779 (2023).',
    url: 'https://arxiv.org/abs/2304.02819',
  },
  {
    n: 19,
    cite: 'Kirchenbauer, J. et al. "A Watermark for Large Language Models." ICML 2023. [KGW]',
    url: 'https://arxiv.org/abs/2301.10226',
  },
  {
    n: 20,
    cite: 'Hu, X. et al. "RADAR: Robust AI-Text Detection via Adversarial Learning." NeurIPS 2023.',
    url: 'https://arxiv.org/abs/2307.03838',
  },
  {
    n: 21,
    cite: 'Krishna, K. et al. "Paraphrasing evades detectors... but retrieval is an effective defense." 2023. [DIPPER]',
    url: 'https://arxiv.org/abs/2303.13408',
  },
  {
    n: 24,
    cite: 'Hans, A. et al. "Spotting LLMs with Binoculars: Zero-Shot Detection." ICML 2024.',
    url: 'https://arxiv.org/abs/2401.12070',
  },
  {
    n: 25,
    cite: 'Creo, A. & Pu, S. "SilverSpeak: Evading AI-Generated Text Detectors using Homoglyphs." 2024.',
    url: 'https://arxiv.org/abs/2406.11239',
  },
];
