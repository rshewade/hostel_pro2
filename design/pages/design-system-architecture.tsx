/**
 * Architecture & Tokens Sandbox
 *
 * This page validates the component architecture strategy by demonstrating:
 * - Token consumption patterns
 * - Component variant usage
 * - Naming conventions in practice
 * - Responsive behavior testing
 */

'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Input,
  Card,
  Alert,
} from '../../../components';

// Sample component to demonstrate architecture patterns
interface TokenDemoProps {
  label: string;
  token: string;
  value: string;
  preview?: React.ReactNode;
}

function TokenDemo({ label, token, value, preview }: TokenDemoProps) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0">
      <div className="w-32 text-sm font-medium text-navy-700">{label}</div>
      <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded font-mono text-navy-600">
        {token}
      </code>
      <div className="w-24 text-xs text-gray-500 text-right">{value}</div>
      {preview && <div className="w-16 flex justify-end">{preview}</div>}
    </div>
  );
}

export default function ArchitectureSandboxPage() {
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedVariant, setSelectedVariant] = useState<'primary' | 'secondary' | 'ghost' | 'destructive'>('primary');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Architecture & Tokens Sandbox
            </h1>
            <p className="text-sm text-gray-500">
              Validate component patterns and token consumption
            </p>
          </div>
          <a
            href="/design-system"
            className="text-sm font-medium px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'var(--bg-brand)',
              color: 'var(--text-inverse)',
            }}
          >
            ← Design System
          </a>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Architecture Overview */}
          <section>
            <h2 className="text-heading-2 mb-4">Component Architecture</h2>
            <div className="card p-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'forms/', desc: 'Form controls', count: 9 },
                  { name: 'ui/', desc: 'Basic elements', count: 4 },
                  { name: 'data/', desc: 'Data display', count: 6 },
                  { name: 'feedback/', desc: 'User feedback', count: 8 },
                  { name: 'layout/', desc: 'Layout utils', count: 4 },
                  { name: 'print/', desc: 'Print layouts', count: 5 },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                    <code className="text-sm font-mono text-gold-600">{cat.name}</code>
                    <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                    <Badge variant="info" className="mt-2">{cat.count} components</Badge>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Token Consumption Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Token Consumption Patterns</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Color Tokens */}
              <Card title="Semantic Color Tokens" className="card">
                <TokenDemo
                  label="Background"
                  token="var(--bg-primary)"
                  value="#ffffff"
                  preview={
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: 'var(--bg-primary)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Brand BG"
                  token="var(--bg-brand)"
                  value="navy-900"
                  preview={
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: 'var(--bg-brand)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Accent BG"
                  token="var(--bg-accent)"
                  value="gold-500"
                  preview={
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Text Primary"
                  token="var(--text-primary)"
                  value="navy-900"
                  preview={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Aa</span>
                  }
                />
                <TokenDemo
                  label="Text Secondary"
                  token="var(--text-secondary)"
                  value="gray-600"
                  preview={
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Aa</span>
                  }
                />
              </Card>

              {/* Spacing Tokens */}
              <Card title="Spacing Tokens" className="card">
                {[
                  { name: 'space-1', value: '4px' },
                  { name: 'space-2', value: '8px' },
                  { name: 'space-4', value: '16px' },
                  { name: 'space-6', value: '24px' },
                  { name: 'space-8', value: '32px' },
                ].map((space) => (
                  <TokenDemo
                    key={space.name}
                    label={space.name}
                    token={`var(--${space.name})`}
                    value={space.value}
                    preview={
                      <div
                        className="h-4 rounded bg-gold-500"
                        style={{ width: `var(--${space.name})` }}
                      />
                    }
                  />
                ))}
              </Card>
            </div>
          </section>

          {/* Variant Properties Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Variant Properties Schema</h2>

            <Card title="Interactive Variant Testing" className="card">
              <div className="space-y-6">
                {/* Size Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Size Variants: sm | md | lg</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <div key={size} className="text-center">
                        <Button
                          size={size}
                          variant={selectedVariant}
                          onClick={() => setSelectedSize(size)}
                          className={selectedSize === size ? 'ring-2 ring-offset-2 ring-gold-500' : ''}
                        >
                          {size.toUpperCase()} Button
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">size="{size}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Button Variants: primary | secondary | ghost | destructive</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) => (
                      <div key={variant} className="text-center">
                        <Button
                          variant={variant}
                          size={selectedSize}
                          onClick={() => setSelectedVariant(variant)}
                          className={selectedVariant === variant ? 'ring-2 ring-offset-2 ring-navy-500' : ''}
                        >
                          {variant.charAt(0).toUpperCase() + variant.slice(1)}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">variant="{variant}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Status Variants: default | success | warning | error | info</h4>
                  <div className="flex flex-wrap gap-3">
                    {(['default', 'success', 'warning', 'error', 'info'] as const).map((status) => (
                      <div key={status} className="text-center">
                        <Badge variant={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">variant="{status}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Naming Conventions Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Naming Conventions</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card title="File & Component Naming" className="card">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Component File:</span>
                    <code className="text-navy-700">Button.tsx</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Export Name:</span>
                    <code className="text-navy-700">Button</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Props Interface:</span>
                    <code className="text-navy-700">ButtonProps</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant Type:</span>
                    <code className="text-navy-700">ButtonVariant</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Constants:</span>
                    <code className="text-navy-700">BUTTON_VARIANT_CLASSES</code>
                  </div>
                </div>
              </Card>

              <Card title="Import Patterns" className="card">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Main barrel import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import { Button, Input } from '@/components';`}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import { Button, Badge } from '@/components/ui';`}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import type { ButtonProps } from '@/components';`}
                    </code>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Component Pattern Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Component Patterns Validation</h2>

            <Card title="Form Field Pattern" className="card">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Standard Input"
                    placeholder="Enter value..."
                    helperText="Helper text appears below"
                  />
                  <Input
                    label="With Error"
                    placeholder="Invalid input"
                    error="This field has an error"
                  />
                  <Input
                    label="Required Field"
                    placeholder="Required"
                    required
                  />
                  <Input
                    label="Disabled"
                    placeholder="Cannot edit"
                    disabled
                    value="Disabled value"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">Pattern Checklist</h4>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Label association via htmlFor',
                      'Error message with role="alert"',
                      'aria-describedby for errors/helpers',
                      'Required indicator (*)',
                      'Disabled styling',
                      'Focus ring visibility',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Component Mapping to UI Libraries */}
          <section>
            <h2 className="text-heading-2 mb-4">Component Mapping to UI Libraries</h2>
            <p className="text-body-sm mb-6">
              Reference table mapping our components to equivalent components in popular UI libraries for easier implementation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Our Component</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">MUI Equivalent</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Ant Design Equivalent</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ours: 'Button', mui: 'Button', antd: 'Button', notes: 'Supports primary, secondary, ghost, destructive variants' },
                    { ours: 'Input', mui: 'TextField', antd: 'Input', notes: 'Includes label, error, helperText props' },
                    { ours: 'Textarea', mui: 'TextField (multiline)', antd: 'Input.TextArea', notes: 'Multi-line text input' },
                    { ours: 'Select', mui: 'Select', antd: 'Select', notes: 'Dropdown selection' },
                    { ours: 'Checkbox', mui: 'Checkbox', antd: 'Checkbox', notes: 'With optional label' },
                    { ours: 'Radio/RadioGroup', mui: 'Radio/RadioGroup', antd: 'Radio.Group', notes: 'Group radio buttons' },
                    { ours: 'Toggle', mui: 'Switch', antd: 'Switch', notes: 'Boolean toggle switch' },
                    { ours: 'DatePicker', mui: 'DatePicker', antd: 'DatePicker', notes: 'Date selection' },
                    { ours: 'Badge', mui: 'Chip', antd: 'Tag', notes: 'Status indicators' },
                    { ours: 'Chip', mui: 'Chip', antd: 'Tag', notes: 'Closable, selectable chips' },
                    { ours: 'Tag', mui: 'Chip (variant)', antd: 'Tag', notes: 'Simple labels' },
                    { ours: 'Card', mui: 'Card', antd: 'Card', notes: 'Content container with title/actions' },
                    { ours: 'Table', mui: 'DataGrid', antd: 'Table', notes: 'Sortable, paginated tables' },
                    { ours: 'List', mui: 'List', antd: 'List', notes: 'Vertical item lists' },
                    { ours: 'Tabs', mui: 'Tabs', antd: 'Tabs', notes: 'Tab navigation' },
                    { ours: 'Accordion', mui: 'Accordion', antd: 'Collapse', notes: 'Expandable panels' },
                    { ours: 'Stepper', mui: 'Stepper', antd: 'Steps', notes: 'Multi-step progress' },
                    { ours: 'Modal', mui: 'Dialog', antd: 'Modal', notes: 'Supports sm/md/lg/xl/full sizes' },
                    { ours: 'SidePanel', mui: 'Drawer', antd: 'Drawer', notes: 'Slide-in panels' },
                    { ours: 'Toast/ToastProvider', mui: 'Snackbar', antd: 'message/notification', notes: 'Use useToast() hook' },
                    { ours: 'Alert', mui: 'Alert', antd: 'Alert', notes: 'Inline alerts' },
                    { ours: 'Banner', mui: 'Alert (banner)', antd: 'Alert (banner)', notes: 'Full-width banners' },
                    { ours: 'Spinner', mui: 'CircularProgress', antd: 'Spin', notes: 'Loading indicator' },
                    { ours: 'EmptyState', mui: '-', antd: 'Empty', notes: 'Empty data placeholder' },
                    { ours: 'Grid', mui: 'Grid', antd: 'Row/Col', notes: 'Responsive grid layout' },
                    { ours: 'Flex', mui: 'Stack', antd: 'Flex', notes: 'Flexbox container' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-navy-700">{row.ours}</td>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-gray-600">{row.mui}</td>
                      <td className="border border-gray-200 px-4 py-2 font-mono text-gray-600">{row.antd}</td>
                      <td className="border border-gray-200 px-4 py-2 text-gray-500">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Do's and Don'ts */}
          <section>
            <h2 className="text-heading-2 mb-4">Usage Guidelines: Do's and Don'ts</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Do's */}
              <Card title="Do's" className="card border-l-4 border-l-green-500">
                <ul className="space-y-3 text-sm">
                  {[
                    'Use semantic color tokens (--text-primary) instead of raw colors',
                    'Always include aria-label for icon-only buttons',
                    'Use the label prop on form fields for accessibility',
                    'Prefer size="md" as the default button size',
                    'Use ToastProvider at app root and useToast() hook for toasts',
                    'Apply variant props for consistent styling',
                    'Use Grid/Flex components for responsive layouts',
                    'Include loading states for async operations',
                    'Use Modal size="full" for complex forms on mobile',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Don'ts */}
              <Card title="Don'ts" className="card border-l-4 border-l-red-500">
                <ul className="space-y-3 text-sm">
                  {[
                    'Don\'t use hardcoded colors - use design tokens',
                    'Don\'t create custom buttons - use Button variants',
                    'Don\'t skip error states on form fields',
                    'Don\'t nest interactive elements (button inside button)',
                    'Don\'t use Toast component directly - use ToastProvider',
                    'Don\'t mix Tailwind with inline styles for same property',
                    'Don\'t create new components for existing patterns',
                    'Don\'t forget focus states for keyboard accessibility',
                    'Don\'t use raw div for semantic layout - use Grid/Flex',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* Edge Cases & Best Practices */}
          <section>
            <h2 className="text-heading-2 mb-4">Edge Cases & Best Practices</h2>

            <div className="space-y-4">
              <Card title="Long Text Handling" className="card">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Buttons with long text use truncate prop:</p>
                    <Button truncate className="max-w-[200px]">
                      This is a very long button label that should truncate
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Badges handle overflow gracefully:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Short</Badge>
                      <Badge variant="info" className="max-w-[120px] truncate">
                        Very long badge text that truncates
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Loading States" className="card">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button loading>Saving...</Button>
                  <Button loading variant="secondary">Processing</Button>
                  <Button loading variant="destructive">Deleting</Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Loading prop disables interaction and shows spinner. Combine with descriptive text.
                </p>
              </Card>

              <Card title="Empty States" className="card">
                <p className="text-sm text-gray-600 mb-3">
                  Always provide helpful empty states with clear actions:
                </p>
                <div className="border rounded-lg p-6 bg-gray-50 text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900">No documents yet</p>
                  <p className="text-sm text-gray-500 mt-1">Upload your first document to get started.</p>
                  <Button size="sm" className="mt-4">Upload Document</Button>
                </div>
              </Card>

              <Card title="Print Components" className="card">
                <p className="text-sm text-gray-600 mb-3">
                  Print-optimized components available for formal documents:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded p-3 text-center">
                    <code className="text-xs text-navy-700">A4Page</code>
                    <p className="text-xs text-gray-500 mt-1">A4 document layout</p>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <code className="text-xs text-navy-700">Letter</code>
                    <p className="text-xs text-gray-500 mt-1">Formal letters</p>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <code className="text-xs text-navy-700">Receipt</code>
                    <p className="text-xs text-gray-500 mt-1">Payment receipts</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Responsive Test */}
          <section>
            <h2 className="text-heading-2 mb-4">Responsive Behavior Test</h2>

            <Alert
              variant="info"
              message="Resize the browser window to test responsive behavior of components below."
              className="mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="card">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    />
                    <h4 className="font-medium text-navy-900">Card {i}</h4>
                    <p className="text-sm text-gray-500">Responsive grid item</p>
                    <Button size="sm" variant="secondary" className="mt-3 w-full">
                      Action
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer
            className="text-center pt-8 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <p className="text-caption">
              Architecture Sandbox - Component Library v1.0
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
