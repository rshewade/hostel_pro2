// Print layout constants for document and undertaking print views

export const PRINT_PAPER_SIZES = {
  A4: 'width: 210mm; min-height: 297mm;',
  LETTER: 'width: 216mm; min-height: 279mm;',
  LEGAL: 'width: 216mm; min-height: 279mm;'
} as const;

export const PRINT_MARGINS = {
  sm: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
  md: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
  lg: { top: '25mm', bottom: '25mm', left: '25mm', right: '25mm' }
} as const;

export const PRINT_TYPOGRAPHY = {
  heading: [
    'text-2xl font-bold',
    'print:text-[22pt]'
  ],
  body: [
    'text-base leading-relaxed',
    'print:text-[11pt]'
  ],
  caption: [
    'text-sm font-medium',
    'print:text-[10pt]'
  ],
  label: [
    'text-sm font-medium',
    'print:text-[10pt]'
  ],
  small: [
    'text-xs',
    'print:text-[9pt]'
  ]
} as const;

export const PRINT_COLORS = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  success: 'var(--color-green-600)',
  warning: 'var(--color-amber-600)',
  error: 'var(--color-red-600)',
  info: 'var(--color-blue-600)',
  border: 'var(--border-primary)',
  'border-light': 'var(--color-gray-200)',
  'border-black': '#000000'
} as const;

export const PRINT_BORDER_STYLES = {
  thin: 'border border-gray-200 print:border-black',
  medium: 'border-2 border-gray-300 print:border-black',
  thick: 'border-4 border-gray-400 print:border-black'
} as const;

export const PRINT_SIGNATURE_BLOCK = {
  container: 'flex items-end justify-between pt-8 border-t-2 border-gray-200 print:border-black',
  left: 'flex-1 space-y-2',
  right: 'flex-1 text-right space-y-2'
} as const;

export const PRINT_PAGE_BREAK = [
  'break-after-page',
  'break-before-page'
] as const;

export const DOCUMENT_PRINT_CLASSES = {
  header: 'text-center mb-6 pb-4 border-b-2 border-gray-200 print:border-black',
  title: 'text-2xl font-bold text-center mb-4',
  section: 'mb-6 pb-4 border-b-2 border-gray-200 print:border-black',
  metadata: 'space-y-2 text-sm mb-6',
  footer: 'mt-8 pt-4 border-t-2 border-gray-200 print:border-black'
} as const;
