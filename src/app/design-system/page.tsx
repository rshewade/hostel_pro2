/**
 * Design System Demo Page
 *
 * This page showcases all design tokens and validates the design system implementation.
 * It serves as a reference for developers and a visual test for WCAG AA compliance.
 *
 * Design Reference: trust-seva-setu.lovable.app
 */

'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Chip,
  Tag,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  DatePicker,
  Card,
  Table,
  List,
  Stepper,
  Tabs,
  Accordion,
  Modal,
  Toast,
  Banner,
  Alert,
  Spinner,
  EmptyState,
  Container,
  Grid,
  Flex,
  Spacer,
  SidePanel,
  Receipt,
  ReceiptRow,
  ReceiptDivider,
} from '../../components';

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b sticky top-0 z-10"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
          >
            Design System
          </h1>
          <a
            href="/"
            className="text-sm font-medium px-4 py-2 rounded-md"
            style={{
              backgroundColor: "var(--bg-brand)",
              color: "var(--text-inverse)",
            }}
          >
            ← Back to Home
          </a>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Intro */}
          <section className="text-center">
            <h2 className="text-heading-1 mb-4">Jain Hostel Design System</h2>
            <p className="text-body-sm max-w-2xl mx-auto">
              Design tokens and components for the Hostel Management Application.
              Matching the visual identity of trust-seva-setu.lovable.app
            </p>
          </section>

          {/* Color Palette */}
          <section className="space-y-8">
            <h2 className="text-heading-2">Color Palette</h2>

            {/* Navy - Primary */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Navy (Primary Brand)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-navy-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Gold - Accent */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Gold (Accent)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-gold-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Neutral Gray */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Neutral (Warm Gray)</h3>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-11">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
                  (shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className="h-14 w-full rounded-lg border"
                        style={{
                          backgroundColor: `var(--color-gray-${shade})`,
                          borderColor: "var(--border-primary)",
                        }}
                      />
                      <span className="text-caption mt-1 block">{shade}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-3">
              <h3 className="text-heading-4">Semantic States</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-success-bg)",
                    borderColor: "var(--state-success-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-success-text)" }}
                  >
                    Success
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-error-bg)",
                    borderColor: "var(--state-error-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-error-text)" }}
                  >
                    Error
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-warning-bg)",
                    borderColor: "var(--state-warning-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-warning-text)" }}
                  >
                    Warning
                  </p>
                </div>
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "var(--state-info-bg)",
                    borderColor: "var(--state-info-border)",
                  }}
                >
                  <p
                    className="text-button"
                    style={{ color: "var(--state-info-text)" }}
                  >
                    Info
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Typography</h2>

            <div className="card p-8">
              <div className="space-y-6">
                <div>
                  <span className="text-caption">Display (Playfair Display / 48px / Bold)</span>
                  <p className="text-display">Boys' Hostel Admissions</p>
                </div>
                <div>
                  <span className="text-caption">Heading 1 (Playfair Display / 36px / Bold)</span>
                  <p className="text-heading-1">Welcome to Jain Hostel</p>
                </div>
                <div>
                  <span className="text-caption">Heading 2 (Playfair Display / 30px / Semibold)</span>
                  <p className="text-heading-2">Application Process</p>
                </div>
                <div>
                  <span className="text-caption">Heading 3 (Playfair Display / 24px / Semibold)</span>
                  <p className="text-heading-3">Required Documents</p>
                </div>
                <div>
                  <span className="text-caption">Heading 4 (Inter / 20px / Semibold)</span>
                  <p className="text-heading-4">Start Your Application</p>
                </div>
                <div>
                  <span className="text-caption">Subheading (Inter / 18px / Medium)</span>
                  <p className="text-subheading">Seth Hirachand Gumanji Jain Trust</p>
                </div>
                <div>
                  <span className="text-caption">Body (Inter / 16px / Normal)</span>
                  <p className="text-body">
                    Serving the Jain community through education, shelter, and spiritual
                    welfare since 1940. Our hostels provide a safe and supportive environment.
                  </p>
                </div>
                <div>
                  <span className="text-caption">Body Small (Inter / 14px / Normal)</span>
                  <p className="text-body-sm">
                    You will be redirected to our secure portal for registration.
                  </p>
                </div>
                <div>
                  <span className="text-caption">Caption (Inter / 12px / Normal)</span>
                  <p className="text-caption">Last updated: December 2024</p>
                </div>
              </div>
            </div>
          </section>

          {/* Spacing */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Spacing Scale</h2>
            <div className="card p-8">
              <div className="space-y-3">
                {[
                  { name: "space-1", value: "4px" },
                  { name: "space-2", value: "8px" },
                  { name: "space-3", value: "12px" },
                  { name: "space-4", value: "16px" },
                  { name: "space-6", value: "24px" },
                  { name: "space-8", value: "32px" },
                  { name: "space-10", value: "40px" },
                  { name: "space-16", value: "64px" },
                ].map(({ name, value }) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="w-24 text-caption">{name}</span>
                    <div
                      className="h-4 rounded"
                      style={{
                        width: `var(--${name})`,
                        backgroundColor: "var(--bg-brand)",
                      }}
                    />
                    <span className="text-body-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Border Radius</h2>
            <div className="card p-8">
              <div className="flex flex-wrap gap-8">
                {[
                  { name: "none", value: "0" },
                  { name: "sm", value: "4px" },
                  { name: "md", value: "8px" },
                  { name: "lg", value: "12px" },
                  { name: "xl", value: "16px" },
                  { name: "2xl", value: "24px" },
                  { name: "full", value: "9999px" },
                ].map(({ name, value }) => (
                  <div key={name} className="text-center">
                    <div
                      className="h-16 w-16"
                      style={{
                        borderRadius: `var(--radius-${name})`,
                        backgroundColor: "var(--bg-brand)",
                      }}
                    />
                    <p className="text-caption mt-2">
                      {name} ({value})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Shadows */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Elevation / Shadows</h2>
            <div
              className="p-8 rounded-xl"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex flex-wrap gap-8">
                {["xs", "sm", "md", "lg", "xl", "card"].map((size) => (
                  <div key={size} className="text-center">
                    <div
                      className="h-20 w-20 rounded-lg"
                      style={{
                        boxShadow: `var(--shadow-${size})`,
                        backgroundColor: "var(--surface-primary)",
                      }}
                    />
                    <p className="text-caption mt-2">shadow-{size}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Buttons</h2>
            <div className="card p-8">
              <div className="flex flex-wrap gap-4 items-center">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
                <button
                  className="btn-primary"
                  style={{ backgroundColor: "var(--bg-brand)" }}
                >
                  Brand Button
                </button>
              </div>
            </div>
          </section>

          {/* Number Badges */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Number Badges</h2>
            <div className="card p-8">
              <div className="flex gap-4 items-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} className="number-badge">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Sample Cards */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Cards</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Application Process Card */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--color-gold-600)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-heading-4">Application Process</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Check eligibility criteria",
                    "Create account / Login",
                    "Fill online application form",
                  ].map((step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="number-badge">{index + 1}</span>
                      <span className="text-body">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents Card */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--color-gold-600)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-heading-4">Required Documents</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Birth Certificate",
                    "Caste Certificate (Jain Community)",
                    "College Admission Letter",
                  ].map((doc) => (
                    <li key={doc} className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0 check-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-body">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Form Elements */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Form Elements</h2>
            <div className="card p-8 max-w-md">
               <div className="space-y-4">
                <div>
                  <label className="text-label block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-label block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-label block mb-1">Hostel Type</label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border text-body outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--surface-primary)",
                    }}
                  >
                    <option>Boys Hostel</option>
                    <option>Girls Ashram</option>
                    <option>Dharamshala</option>
                  </select>
                 </div>
                <Button variant="primary" size="lg" className="w-full mt-4">Submit Application</Button>
              </div>
            </div>
          </section>

          {/* UI Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">UI Components</h2>

            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Buttons</h3>
              <div className="card p-8">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button>Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button loading>Loading</Button>
                  <Button leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>
                    With Icon
                  </Button>
                </div>
              </div>
            </div>

            {/* Badges, Chips, Tags */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Badges, Chips & Tags</h3>
              <div className="card p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-subheading mb-3">Badges</h4>
                    <div className="flex flex-wrap gap-3">
                      <Badge>Default</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="error">Error</Badge>
                      <Badge variant="info">Info</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-subheading mb-3">Chips</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip>Default Chip</Chip>
                      <Chip variant="success">Success Chip</Chip>
                      <Chip variant="warning" onClose={() => {}}>Closable</Chip>
                      <Chip leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}>
                        With Icon
                      </Chip>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-subheading mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-3">
                      <Tag>Default Tag</Tag>
                      <Tag variant="success">Success Tag</Tag>
                      <Tag variant="warning">Warning Tag</Tag>
                      <Tag variant="error">Error Tag</Tag>
                      <Tag variant="info">Info Tag</Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Form Components</h2>

            <div className="card p-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Input */}
                <div className="space-y-4">
                  <h3 className="text-heading-4">Input Fields</h3>
                  <Input label="Full Name" placeholder="Enter your full name" />
                  <Input label="Email" type="email" placeholder="Enter your email" />
                  <Input label="Error State" error="This field is required" />
                  <Input label="Success State" variant="success" />
                  <Input label="With Icon" leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
                </div>

                {/* Other Form Elements */}
                <div className="space-y-4">
                  <h3 className="text-heading-4">Other Form Elements</h3>
                  <Textarea label="Message" placeholder="Enter your message" rows={3} />
                  <Select
                    label="Hostel Type"
                    options={[
                      { value: 'boys', label: 'Boys Hostel' },
                      { value: 'girls', label: 'Girls Ashram' },
                      { value: 'dharamshala', label: 'Dharamshala' },
                    ]}
                    placeholder="Select hostel type"
                  />
                  <DatePicker label="Birth Date" />
                  <div className="space-y-2">
                    <Checkbox label="I agree to the terms and conditions" />
                    <Checkbox label="Subscribe to newsletter" defaultChecked />
                  </div>
                  <RadioGroup
                    label="Gender"
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Data Display Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Data Display Components</h2>

            {/* Cards */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Cards</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Card
                  title="Application Status"
                  subtitle="Track your admission progress"
                  actions={<Button size="sm">View Details</Button>}
                >
                  <p className="text-body-sm text-gray-600">
                    Your application is currently under review. We'll notify you once there's an update.
                  </p>
                </Card>

                <Card title="Quick Actions" shadow="lg">
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start">
                      Update Profile
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      View Documents
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      Contact Support
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Table */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Table</h3>
              <Table
                data={[
                  { id: 1, name: 'John Doe', status: 'Approved', amount: 5000 },
                  { id: 2, name: 'Jane Smith', status: 'Pending', amount: 4500 },
                  { id: 3, name: 'Bob Johnson', status: 'Rejected', amount: 0 },
                ]}
                columns={[
                  { key: 'name', header: 'Name', sortable: true },
                  { key: 'status', header: 'Status', sortable: true },
                  {
                    key: 'amount',
                    header: 'Amount',
                    render: (value) => `₹${value.toLocaleString()}`
                  },
                ]}
              />
            </div>

            {/* List */}
            <div className="space-y-4">
              <h3 className="text-heading-3">List</h3>
              <List
                items={[
                  {
                    id: 1,
                    content: <div><strong>John Doe</strong><br /><span className="text-sm text-gray-600">Approved - Room 101</span></div>,
                    actions: <Button size="sm">View</Button>
                  },
                  {
                    id: 2,
                    content: <div><strong>Jane Smith</strong><br /><span className="text-sm text-gray-600">Pending Review</span></div>,
                    actions: <Button size="sm" variant="secondary">Edit</Button>
                  },
                ]}
              />
            </div>

            {/* Stepper */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Stepper</h3>
              <Stepper
                steps={[
                  { title: 'Application', description: 'Submit your details', completed: true },
                  { title: 'Review', description: 'Under review', active: true },
                  { title: 'Approval', description: 'Final decision' },
                  { title: 'Check-in', description: 'Move to hostel' },
                ]}
                currentStep={1}
              />
            </div>

            {/* Tabs */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Tabs</h3>
              <Tabs
                tabs={[
                  { id: 'overview', label: 'Overview', content: <p>Application overview content...</p> },
                  { id: 'documents', label: 'Documents', content: <p>Document management...</p> },
                  { id: 'payments', label: 'Payments', content: <p>Payment history...</p> },
                ]}
                defaultActiveTab="overview"
              />
            </div>

            {/* Accordion */}
            <div className="space-y-4">
              <h3 className="text-heading-3">Accordion</h3>
              <Accordion
                items={[
                  {
                    id: 'eligibility',
                    title: 'Eligibility Criteria',
                    content: 'Details about who can apply for hostel admission...'
                  },
                  {
                    id: 'documents',
                    title: 'Required Documents',
                    content: 'List of documents needed for application...'
                  },
                  {
                    id: 'fees',
                    title: 'Fee Structure',
                    content: 'Information about hostel fees and payment...'
                  },
                ]}
              />
            </div>
          </section>

          {/* Feedback Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Feedback Components</h2>

            <div className="card p-8">
              <div className="space-y-6">
                {/* Modal Trigger */}
                <div>
                  <h3 className="text-heading-3 mb-4">Modal & Side Panel</h3>
                  <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                    <Button variant="secondary" onClick={() => setSidePanelOpen(true)}>Open Side Panel</Button>
                  </div>
                </div>

                {/* Alerts and Banners */}
                <div className="space-y-4">
                  <h3 className="text-heading-3">Alerts & Banners</h3>
                  <Alert title="Success!" message="Your application has been submitted successfully." variant="success" />
                  <Alert title="Warning" message="Please review your information before submitting." variant="warning" closable />
                  <Alert message="There was an error processing your request." variant="error" />
                  <Banner title="Important Notice" message="Hostel admission deadline is approaching." variant="info" closable />
                </div>

                {/* Loading and Empty States */}
                <div className="space-y-4">
                  <h3 className="text-heading-3">Loading & Empty States</h3>
                  <div className="flex items-center space-x-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner showText text="Loading data..." />
                  </div>

                  <div className="border rounded-lg p-8">
                    <EmptyState
                      title="No Applications Found"
                      description="You haven't submitted any applications yet."
                      action={{ label: 'Create Application', onClick: () => {} }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Layout Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Layout Components</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-heading-3 mb-4">Container</h3>
                <Container className="bg-gray-100 p-4">
                  <p>This content is constrained to a max-width container.</p>
                </Container>
              </div>

              <div>
                <h3 className="text-heading-3 mb-4">Grid</h3>
                <Grid cols={{ default: 1, md: 3 }} gap="md" className="bg-gray-100 p-4">
                  <div className="bg-white p-4 rounded">Grid Item 1</div>
                  <div className="bg-white p-4 rounded">Grid Item 2</div>
                  <div className="bg-white p-4 rounded">Grid Item 3</div>
                </Grid>
              </div>

              <div>
                <h3 className="text-heading-3 mb-4">Flex</h3>
                <Flex gap="md" className="bg-gray-100 p-4">
                  <div className="bg-white p-4 rounded flex-1">Flex Item 1</div>
                  <div className="bg-white p-4 rounded flex-1">Flex Item 2</div>
                  <div className="bg-white p-4 rounded flex-1">Flex Item 3</div>
                </Flex>
              </div>

              <div>
                <h3 className="text-heading-3 mb-4">Spacer</h3>
                <div className="bg-gray-100 p-4">
                  <div className="bg-white p-4 rounded">Content Above</div>
                  <Spacer size="lg" />
                  <div className="bg-white p-4 rounded">Content Below</div>
                </div>
              </div>
            </div>
          </section>

          {/* Print Components */}
          <section className="space-y-6">
            <h2 className="text-heading-2">Print Components</h2>
            <p className="text-body-sm mb-4">
              Print-optimized components for formal documents, receipts, and letters.
              These components are styled for both screen display and print output.
            </p>

            <div className="card p-8">
              <h3 className="text-heading-3 mb-4">Receipt Example</h3>
              <div className="max-w-sm mx-auto">
                <Receipt
                  title="Payment Receipt"
                  receiptNumber="RCP-2024-001234"
                  date="21 Dec 2024"
                  organizationName="Seth Hirachand Gumanji Jain Trust"
                  organizationAddress="Jain Hostel, Mumbai - 400001"
                  size="half-a4"
                >
                  <ReceiptRow label="Student Name" value="John Doe" />
                  <ReceiptRow label="Room Number" value="101-A" />
                  <ReceiptDivider />
                  <ReceiptRow label="Hostel Fee" value="₹15,000" />
                  <ReceiptRow label="Mess Fee" value="₹5,000" />
                  <ReceiptRow label="Maintenance" value="₹1,000" />
                  <ReceiptDivider />
                  <ReceiptRow label="Total Amount" value="₹21,000" bold />
                  <ReceiptRow label="Payment Mode" value="UPI" />
                </Receipt>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Use Ctrl+P to test print styling
              </p>
            </div>
          </section>

          {/* Modal Implementation */}
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Design System Modal"
          >
            <p className="text-body">
              This is a demonstration of the Modal component. It includes proper focus management,
              keyboard navigation (ESC to close), and backdrop click handling.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </Modal>

          {/* SidePanel Implementation */}
          <SidePanel
            isOpen={sidePanelOpen}
            onClose={() => setSidePanelOpen(false)}
            title="Side Panel Demo"
            size="md"
            footer={
              <>
                <Button variant="secondary" onClick={() => setSidePanelOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSidePanelOpen(false)}>
                  Save Changes
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-body">
                This is a demonstration of the SidePanel component. It slides in from
                the right and is perfect for forms, details views, and editing contexts.
              </p>
              <Input label="Name" placeholder="Enter name..." />
              <Textarea label="Description" placeholder="Enter description..." rows={3} />
              <Select
                label="Category"
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'low', label: 'Low Priority' },
                ]}
              />
            </div>
          </SidePanel>

          {/* Footer */}
          <footer
            className="text-center pt-8 border-t"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <p className="text-caption">
              Design System v1.0 - Matching trust-seva-setu.lovable.app - WCAG AA Compliant
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
