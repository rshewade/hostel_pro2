'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/data/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, Eye, Database, User, Clock, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const DPDPPolicyPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    collection: true,
    usage: false,
    sharing: false,
    retention: false,
    rights: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sections = [
    {
      id: 'collection',
      title: 'Data Collection',
      icon: <FileText className="w-5 h-5" />,
      content: `We collect the following personal information for hostel management purposes:

• Personal Identification: Full name, date of birth, gender, photograph
• Contact Information: Residential address, phone number, email address
• Academic Records: Institution name, course/year, enrollment number
• Financial Information: Bank account details, payment history, fee receipts
• Medical Information: Health conditions, allergies, emergency contacts (voluntary)
• Biometric Data: Fingerprint/face recognition for attendance (optional, with explicit consent)`,
    },
    {
      id: 'usage',
      title: 'Data Usage',
      icon: <Eye className="w-5 h-5" />,
      content: `Your data is used exclusively for the following purposes:

• Hostel Admission and Management: Processing applications, room allocation, and stay management
• Academic Coordination: Communication with educational institutions
• Fee Processing: Payment collection, receipt generation, and financial records
• Safety and Security: Emergency contacts, visitor management, and attendance tracking
• Compliance: Meeting legal and regulatory requirements
• Communication: Sending important notices about hostel matters

We do not use your data for any purpose beyond these stated objectives without your explicit consent.`,
    },
    {
      id: 'sharing',
      title: 'Data Sharing',
      icon: <User className="w-5 h-5" />,
      content: `Your personal data may be shared with the following entities under strict conditions:

• Institutional Authorities: Hostel administration and management committees
• Parents/Guardians: For communication and fee matters (with student consent)
• Government Agencies: As required by law (e.g., police, local administration)
• Service Providers: Mess contractors, security services, maintenance providers
• Educational Institutions: For academic coordination and verification

We ensure all third parties adhere to data protection standards through contractual agreements.`,
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: <Database className="w-5 h-5" />,
      content: `We retain your personal data for the following periods:

• Active Stay: Throughout your period of stay at the hostel
• Alumni Records: 1 year after exit for institutional records
• Financial Records: 7 years as per legal and tax requirements
• Application Records: 1 year after rejection or withdrawal
• Consent Records: Permanent (withdrawals noted) for audit purposes

After retention periods, your data is securely deleted or anonymized.`,
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: <Lock className="w-5 h-5" />,
      content: `Under the Data Protection and Privacy Principles (DPDP) Act, you have the following rights:

• Right to Access: Request a copy of all personal data we hold about you
• Right to Rectification: Request correction of inaccurate or incomplete data
• Right to Erasure: Request deletion of your personal data (subject to legal requirements)
• Right to Data Portability: Request your data in a structured, commonly used format
• Right to Withdraw Consent: Withdraw any consent given, with notice that it may affect services
• Right to Lodge Complaints: File complaints with the Data Protection Board

To exercise these rights, contact the Data Protection Officer.`,
    },
    {
      id: 'contact',
      title: 'Contact & Complaints',
      icon: <Shield className="w-5 h-5" />,
      content: `Data Protection Officer Contact:

Email: dpo@hostelmanagement.in
Phone: +91-XXX-XXXX-XXXX
Address: [Institution Address]

For complaints, you may also contact:
Data Protection Board of India
Website: https://dpbi.gov.in`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="bg-white rounded-lg" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Data Protection & Privacy Policy</h1>
              <p className="text-gray-300">Data Protection and Privacy Principles (DPDP) Act Compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm bg-navy-800 p-4 rounded-lg">
            <Shield className="w-5 h-5 text-gold-500" />
            <span>Your privacy rights are protected under Indian law. This policy outlines how we collect, use, and protect your data.</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">We Collect</span>
              </div>
              <p className="text-sm text-blue-800">Personal, academic, and financial data for hostel management</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">We Use</span>
              </div>
              <p className="text-sm text-green-800">Only for admission, stay management, safety, and compliance</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">We Keep</span>
              </div>
              <p className="text-sm text-purple-800">During stay + 1-7 years based on data type</p>
            </div>
          </div>
        </Card>

        <Card padding="none">
          <div className="divide-y divide-gray-200">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-navy-100 rounded-lg text-navy-700">{section.icon}</div>
                    <span className="font-semibold text-gray-900">{section.title}</span>
                  </div>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections[section.id] && (
                  <div className="px-6 pb-6">
                    <div className="pl-12 prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="mt-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Policy Updates</h3>
              <p className="text-sm text-amber-800 mb-3">
                This policy was last updated on January 1, 2025. We may update this policy periodically to reflect changes in practices or regulations.
              </p>
              <p className="text-sm text-amber-800">
                For students, consent renewal is required every 6 months as part of the renewal process. You will be notified when updates require new consent.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For questions about this policy, contact the Data Protection Officer</p>
          <p className="mt-1">
            <a href="mailto:dpo@hostelmanagement.in" className="text-navy-700 hover:underline">
              dpo@hostelmanagement.in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default DPDPPolicyPage;
