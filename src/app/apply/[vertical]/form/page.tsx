'use client';

import { FormWizard, Input, Select, DatePicker, FileUpload } from '@/components/forms';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, FileText, User, GraduationCap, Home, Users, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ApplicationFormPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>({});

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const savedDraft = localStorage.getItem('application_draft_boys-hostel');
        if (savedDraft) {
          setInitialData(JSON.parse(savedDraft));
        } else {
          setInitialData({ vertical: 'boys-hostel' });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        setInitialData({ vertical: 'boys-hostel' });
      }
      setIsLoading(false);
    };

    loadDraft();
  }, []);

  const wizardSteps = [
    {
      id: 'personal-details',
      title: 'Personal Details',
      component: ({
        data,
        onChange,
        errors,
        setErrors,
        isValid,
        setIsValid,
        saving,
      }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-blue-100)' }}>
              <User className="w-6 h-6" style={{ color: 'var(--color-blue-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Personal Information
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Please provide your personal details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={data.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              error={errors.firstName}
              required
              placeholder="Enter first name"
            />

            <Input
              label="Middle Name"
              value={data.middleName || ''}
              onChange={(e) => onChange('middleName', e.target.value)}
              placeholder="Enter middle name (optional)"
            />

            <Input
              label="Last Name"
              value={data.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              error={errors.lastName}
              required
              placeholder="Enter last name"
            />

            <DatePicker
              label="Date of Birth"
              value={data.dob || ''}
              onChange={(e) => onChange('dob', e.target.value)}
              error={errors.dob}
              required
              helperText="You must be at least 18 years old"
            />

            <Select
              label="Gender"
              value={data.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              error={errors.gender}
              required
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Select
              label="Blood Group"
              value={data.bloodGroup || ''}
              onChange={(e) => onChange('bloodGroup', e.target.value)}
              error={errors.bloodGroup}
              required
              options={[
                { value: '', label: 'Select Blood Group' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
              ]}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Permanent Address
            </h3>
            <div className="space-y-4">
              <Input
                label="Address Line 1"
                value={data.addressLine1 || ''}
                onChange={(e) => onChange('addressLine1', e.target.value)}
                error={errors.addressLine1}
                required
                placeholder="House/Flat No, Street, Area"
              />

              <Input
                label="Address Line 2"
                value={data.addressLine2 || ''}
                onChange={(e) => onChange('addressLine2', e.target.value)}
                placeholder="Landmark, Locality"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={data.city || ''}
                  onChange={(e) => onChange('city', e.target.value)}
                  error={errors.city}
                  required
                  placeholder="Enter city"
                />

                <Input
                  label="State"
                  value={data.state || ''}
                  onChange={(e) => onChange('state', e.target.value)}
                  error={errors.state}
                  required
                  placeholder="Enter state"
                />

                <Input
                  label="PIN Code"
                  type="text"
                  value={data.pinCode || ''}
                  onChange={(e) => onChange('pinCode', e.target.value)}
                  error={errors.pinCode}
                  required
                  placeholder="6-digit PIN"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Parent/Guardian Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Father's Name"
                value={data.fatherName || ''}
                onChange={(e) => onChange('fatherName', e.target.value)}
                error={errors.fatherName}
                required
                placeholder="Enter father's full name"
              />

              <Input
                label="Father's Occupation"
                value={data.fatherOccupation || ''}
                onChange={(e) => onChange('fatherOccupation', e.target.value)}
                placeholder="Enter father's occupation"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Father's Mobile Number"
                  type="tel"
                  value={data.fatherMobile || ''}
                  onChange={(e) => onChange('fatherMobile', e.target.value)}
                  error={errors.fatherMobile}
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label="Father's Email"
                  type="email"
                  value={data.fatherEmail || ''}
                  onChange={(e) => onChange('fatherEmail', e.target.value)}
                  placeholder="Enter email (optional)"
                />
              </div>

              <Input
                label="Mother's Name"
                value={data.motherName || ''}
                onChange={(e) => onChange('motherName', e.target.value)}
                error={errors.motherName}
                required
                placeholder="Enter mother's full name"
              />

              <Input
                label="Mother's Occupation"
                value={data.motherOccupation || ''}
                onChange={(e) => onChange('motherOccupation', e.target.value)}
                placeholder="Enter mother's occupation"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mother's Mobile Number"
                  type="tel"
                  value={data.motherMobile || ''}
                  onChange={(e) => onChange('motherMobile', e.target.value)}
                  placeholder="10-digit mobile number (optional)"
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label="Mother's Email"
                  type="email"
                  value={data.motherEmail || ''}
                  onChange={(e) => onChange('motherEmail', e.target.value)}
                  placeholder="Enter email (optional)"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Local Guardian (if different from parents)
            </h3>
            <div className="space-y-4">
              <Input
                label="Guardian Name"
                value={data.guardianName || ''}
                onChange={(e) => onChange('guardianName', e.target.value)}
                placeholder="Enter local guardian's name (optional)"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Relationship"
                  value={data.guardianRelationship || ''}
                  onChange={(e) => onChange('guardianRelationship', e.target.value)}
                  placeholder="e.g., Uncle, Family Friend"
                />

                <Input
                  label="Guardian Mobile"
                  type="tel"
                  value={data.guardianMobile || ''}
                  onChange={(e) => onChange('guardianMobile', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="tel"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Emergency Contact
            </h3>
            <div className="space-y-4">
              <Input
                label="Emergency Contact Person"
                value={data.emergencyContactPerson || ''}
                onChange={(e) => onChange('emergencyContactPerson', e.target.value)}
                error={errors.emergencyContactPerson}
                required
                placeholder="Name of emergency contact"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Emergency Mobile"
                  type="tel"
                  value={data.emergencyMobile || ''}
                  onChange={(e) => onChange('emergencyMobile', e.target.value)}
                  error={errors.emergencyMobile}
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="tel"
                />

                <Input
                  label="Relationship"
                  value={data.emergencyRelationship || ''}
                  onChange={(e) => onChange('emergencyRelationship', e.target.value)}
                  error={errors.emergencyRelationship}
                  required
                  placeholder="e.g., Parent, Sibling"
                />
              </div>
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.firstName?.trim()) errors.firstName = 'First name is required';
        if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!data.dob) errors.dob = 'Date of birth is required';
        if (!data.gender) errors.gender = 'Gender is required';
        if (!data.bloodGroup) errors.bloodGroup = 'Blood group is required';
        if (!data.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required';
        if (!data.city?.trim()) errors.city = 'City is required';
        if (!data.state?.trim()) errors.state = 'State is required';
        if (!data.pinCode?.trim() || !/^\d{6}$/.test(data.pinCode)) {
          errors.pinCode = 'Valid 6-digit PIN code is required';
        }
        if (!data.fatherName?.trim()) errors.fatherName = 'Father name is required';
        if (!data.fatherMobile?.trim() || !/^\d{10}$/.test(data.fatherMobile)) {
          errors.fatherMobile = 'Valid 10-digit mobile number is required';
        }
        if (!data.motherName?.trim()) errors.motherName = 'Mother name is required';
        if (!data.emergencyContactPerson?.trim()) errors.emergencyContactPerson = 'Emergency contact person is required';
        if (!data.emergencyMobile?.trim() || !/^\d{10}$/.test(data.emergencyMobile)) {
          errors.emergencyMobile = 'Valid 10-digit emergency mobile is required';
        }
        if (!data.emergencyRelationship?.trim()) errors.emergencyRelationship = 'Relationship is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'academic-info',
      title: 'Academic Information',
      description: 'Educational details',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green-100)' }}>
              <GraduationCap className="w-6 h-6" style={{ color: 'var(--color-green-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Academic Details
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Please provide your educational background</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Current Institution/College"
              value={data.institution || ''}
              onChange={(e) => onChange('institution', e.target.value)}
              error={errors.institution}
              required
              placeholder="Enter institution name"
            />

            <Input
              label="Course/Degree"
              value={data.course || ''}
              onChange={(e) => onChange('course', e.target.value)}
              error={errors.course}
              required
              placeholder="e.g., B.Com, B.Sc, B.Tech"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Year/Semester"
                value={data.year || ''}
                onChange={(e) => onChange('year', e.target.value)}
                error={errors.year}
                required
                options={[
                  { value: '', label: 'Select Year' },
                  { value: '1', label: '1st Year' },
                  { value: '2', label: '2nd Year' },
                  { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' },
                  { value: '5', label: '5th Year' },
                ]}
              />

              <Input
                label="Percentage/CGPA"
                value={data.percentage || ''}
                onChange={(e) => onChange('percentage', e.target.value)}
                error={errors.percentage}
                required
                placeholder="e.g., 85% or 8.5 CGPA"
                inputMode="decimal"
              />
            </div>

            <Input
              label="Previous Academic Qualification"
              value={data.qualification || ''}
              onChange={(e) => onChange('qualification', e.target.value)}
              error={errors.qualification}
              required
              placeholder="e.g., 12th (HSC), Diploma, etc."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Board/University"
                value={data.board || ''}
                onChange={(e) => onChange('board', e.target.value)}
                error={errors.board}
                required
                placeholder="e.g., Maharashtra State Board, Mumbai University"
              />

              <Input
                label="Passing Year"
                type="number"
                value={data.passingYear || ''}
                onChange={(e) => onChange('passingYear', e.target.value)}
                error={errors.passingYear}
                required
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.institution?.trim()) errors.institution = 'Institution name is required';
        if (!data.course?.trim()) errors.course = 'Course name is required';
        if (!data.year) errors.year = 'Year is required';
        if (!data.percentage?.trim()) errors.percentage = 'Percentage/CGPA is required';
        if (!data.qualification?.trim()) errors.qualification = 'Qualification is required';
        if (!data.board?.trim()) errors.board = 'Board/University is required';
        if (!data.passingYear) errors.passingYear = 'Passing year is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'hostel-preferences',
      title: 'Hostel Preferences',
      description: 'Room and duration preferences',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-amber-100)' }}>
              <Home className="w-6 h-6" style={{ color: 'var(--color-amber-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Hostel Preferences
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Specify your room type and stay preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label="Vertical"
              value={data.vertical || 'boys-hostel'}
              onChange={(e) => onChange('vertical', e.target.value)}
              disabled
              helperText="This is pre-selected based on your application choice"
              options={[
                { value: 'boys-hostel', label: 'Boys Hostel' },
                { value: 'girls-ashram', label: 'Girls Ashram' },
                { value: 'dharamshala', label: 'Dharamshala' },
              ]}
            />

            <Select
              label="Preferred Room Type"
              value={data.roomType || ''}
              onChange={(e) => onChange('roomType', e.target.value)}
              error={errors.roomType}
              required
              helperText="Subject to availability"
              options={[
                { value: '', label: 'Select Room Type' },
                { value: '2-sharing', label: '2-Sharing' },
                { value: '3-sharing', label: '3-Sharing' },
                { value: '4-sharing', label: '4-Sharing' },
              ]}
            />

            <Select
              label="Duration of Stay"
              value={data.duration || ''}
              onChange={(e) => onChange('duration', e.target.value)}
              error={errors.duration}
              required
              options={[
                { value: '', label: 'Select Duration' },
                { value: '6-months', label: '6 Months' },
                { value: '1-year', label: '1 Year' },
                { value: '2-years', label: '2 Years' },
                { value: '3-years', label: '3 Years' },
                { value: '4-years', label: '4 Years' },
              ]}
            />

            <DatePicker
              label="Intended Joining Date"
              value={data.joiningDate || ''}
              onChange={(e) => onChange('joiningDate', e.target.value)}
              error={errors.joiningDate}
              required
              helperText="Expected date of admission"
            />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Special Requirements (Optional)
              </label>
              <textarea
                value={data.specialRequirements || ''}
                onChange={(e) => onChange('specialRequirements', e.target.value)}
                placeholder="Any specific needs or requirements (e.g., medical conditions, dietary restrictions)"
                className="w-full px-4 py-3 border rounded-lg text-base min-h-[100px]"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Please mention any special needs or health conditions we should be aware of
              </p>
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.roomType) errors.roomType = 'Room type is required';
        if (!data.duration) errors.duration = 'Duration is required';
        if (!data.joiningDate) errors.joiningDate = 'Joining date is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'references',
      title: 'References',
      description: 'Ex-student references',
      component: ({ data, onChange, errors }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-purple-100)' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--color-purple-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                References
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Provide references from ex-students</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Reference 1
              </h3>
              <div className="space-y-4">
                <Input
                  label="Ex-Student Name"
                  value={data.ref1Name || ''}
                  onChange={(e) => onChange('ref1Name', e.target.value)}
                  error={errors.ref1Name}
                  required
                  placeholder="Enter full name of ex-student"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number"
                    type="tel"
                    value={data.ref1Mobile || ''}
                    onChange={(e) => onChange('ref1Mobile', e.target.value)}
                    error={errors.ref1Mobile}
                    required
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="tel"
                  />

                  <Input
                    label="Year of Stay"
                    value={data.ref1Year || ''}
                    onChange={(e) => onChange('ref1Year', e.target.value)}
                    error={errors.ref1Year}
                    required
                    placeholder="e.g., 2020-2023"
                  />
                </div>

                <Input
                  label="Relationship (Optional)"
                  value={data.ref1Relationship || ''}
                  onChange={(e) => onChange('ref1Relationship', e.target.value)}
                  placeholder="e.g., Family friend, Relative, Neighbor"
                />
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Reference 2
              </h3>
              <div className="space-y-4">
                <Input
                  label="Ex-Student Name"
                  value={data.ref2Name || ''}
                  onChange={(e) => onChange('ref2Name', e.target.value)}
                  placeholder="Enter full name of ex-student"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number"
                    type="tel"
                    value={data.ref2Mobile || ''}
                    onChange={(e) => onChange('ref2Mobile', e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="tel"
                  />

                  <Input
                    label="Year of Stay"
                    value={data.ref2Year || ''}
                    onChange={(e) => onChange('ref2Year', e.target.value)}
                    placeholder="e.g., 2021-2024"
                  />
                </div>

                <Input
                  label="Relationship (Optional)"
                  value={data.ref2Relationship || ''}
                  onChange={(e) => onChange('ref2Relationship', e.target.value)}
                  placeholder="e.g., Family friend, Relative, Neighbor"
                />
              </div>
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.ref1Name?.trim()) errors.ref1Name = 'Ex-student name is required';
        if (!data.ref1Mobile?.trim() || !/^\d{10}$/.test(data.ref1Mobile)) {
          errors.ref1Mobile = 'Valid 10-digit mobile number is required';
        }
        if (!data.ref1Year?.trim()) errors.ref1Year = 'Year of stay is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload required documents',
      component: ({ data, onChange, errors, saving }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-blue-100)' }}>
              <Upload className="w-6 h-6" style={{ color: 'var(--color-blue-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Document Upload
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Upload required documents</p>
            </div>
          </div>

          <div className="card p-6 border-2" style={{ backgroundColor: 'var(--color-blue-50)', borderColor: 'var(--color-blue-200)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-5 h-5" />
              Upload Guidelines
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>Accepted formats: PDF, JPG, JPEG</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>Maximum file size: 5 MB per document</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>Ensure documents are clear and readable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>Drag and drop files or click to browse</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <FileUpload
              label="Recent Passport Size Photo"
              value={data.photoFile || null}
              onChange={(file) => onChange('photoFile', file)}
              error={errors.photoFile}
              required
              accept=".jpg,.jpeg,.pdf"
              maxSize={5 * 1024 * 1024}
              showPreview={true}
            />

            <FileUpload
              label="Birth Certificate"
              value={data.birthCertificate || null}
              onChange={(file) => onChange('birthCertificate', file)}
              error={errors.birthCertificate}
              required
              accept=".jpg,.jpeg,.pdf"
              maxSize={5 * 1024 * 1024}
              showPreview={true}
            />

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <FileUpload
                label="Educational Marksheet/Certificate"
                value={data.marksheet || null}
                onChange={(file) => onChange('marksheet', file)}
                error={errors.marksheet}
                required
                accept=".jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                showPreview={true}
              />
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <FileUpload
                label="Community Recommendation Letter (Optional)"
                value={data.recommendationLetter || null}
                onChange={(file) => onChange('recommendationLetter', file)}
                accept=".jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                showPreview={true}
              />
            </div>
          </div>
        </div>
      ),
      validate: (data: any) => {
        const errors: any = {};
        if (!data.photoFile) errors.photoFile = 'Photo is required';
        if (!data.birthCertificate) errors.birthCertificate = 'Birth certificate is required';
        if (!data.marksheet) errors.marksheet = 'Marksheet is required';
        return Object.keys(errors).length > 0 ? errors : null;
      },
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review before submitting',
      component: ({ data }: any) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green-100)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-green-600)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Review Your Application
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Please review all details before submitting</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Personal Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {data.firstName} {data.middleName} {data.lastName}</p>
                <p><strong>Date of Birth:</strong> {data.dob}</p>
                <p><strong>Gender:</strong> {data.gender}</p>
                <p><strong>Blood Group:</strong> {data.bloodGroup}</p>
                <p><strong>Address:</strong> {data.addressLine1}, {data.addressLine2}, {data.city}, {data.state} - {data.pinCode}</p>
                <p><strong>Father:</strong> {data.fatherName} ({data.fatherMobile})</p>
                <p><strong>Mother:</strong> {data.motherName} ({data.motherMobile})</p>
                <p><strong>Emergency Contact:</strong> {data.emergencyContactPerson} ({data.emergencyMobile})</p>
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Academic Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Institution:</strong> {data.institution}</p>
                <p><strong>Course:</strong> {data.course}</p>
                <p><strong>Year:</strong> {data.year}</p>
                <p><strong>Percentage/CGPA:</strong> {data.percentage}</p>
                <p><strong>Qualification:</strong> {data.qualification}</p>
                <p><strong>Board/University:</strong> {data.board}</p>
                <p><strong>Passing Year:</strong> {data.passingYear}</p>
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Hostel Preferences
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Vertical:</strong> {data.vertical === 'boys-hostel' ? 'Boys Hostel' : data.vertical === 'girls-ashram' ? 'Girls Ashram' : 'Dharamshala'}</p>
                <p><strong>Room Type:</strong> {data.roomType}</p>
                <p><strong>Duration:</strong> {data.duration}</p>
                <p><strong>Joining Date:</strong> {data.joiningDate}</p>
                {data.specialRequirements && (
                  <p><strong>Special Requirements:</strong> {data.specialRequirements}</p>
                )}
              </div>
            </div>

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Reference 1
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {data.ref1Name}</p>
                <p><strong>Mobile:</strong> {data.ref1Mobile}</p>
                <p><strong>Year of Stay:</strong> {data.ref1Year}</p>
                {data.ref1Relationship && <p><strong>Relationship:</strong> {data.ref1Relationship}</p>}
              </div>
            </div>

            {data.ref2Name && (
              <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Reference 2
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {data.ref2Name}</p>
                  <p><strong>Mobile:</strong> {data.ref2Mobile}</p>
                  <p><strong>Year of Stay:</strong> {data.ref2Year}</p>
                  {data.ref2Relationship && <p><strong>Relationship:</strong> {data.ref2Relationship}</p>}
                </div>
              </div>
            )}

            <div className="card p-6 border-2" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Documents
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Photo:</strong> {data.photoFile?.name || 'Not uploaded'}</p>
                <p><strong>Birth Certificate:</strong> {data.birthCertificate?.name || 'Not uploaded'}</p>
                <p><strong>Marksheet:</strong> {data.marksheet?.name || 'Not uploaded'}</p>
                {data.recommendationLetter && (
                  <p><strong>Recommendation Letter:</strong> {data.recommendationLetter.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6 border-2" style={{ backgroundColor: 'var(--color-blue-50)', borderColor: 'var(--color-blue-200)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Declaration
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              I hereby declare that all the information provided above is true and correct to the best of my knowledge.
              I understand that any false information may result in rejection of my application.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                required
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                I agree to the terms and conditions and declare that the information provided is accurate
              </span>
            </label>
          </div>
        </div>
      ),
      validate: (data: any) => {
        return null;
      },
    },
  ];

  const handleSaveDraft = async (data: any, step: number) => {
    try {
      localStorage.setItem('application_draft_boys-hostel', JSON.stringify(data));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft locally');
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/applications/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vertical: 'boys-hostel',
          status: 'SUBMITTED',
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const errorMessage = errorData.message || errorData.error || 'Failed to submit application';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      localStorage.removeItem('application_draft_boys-hostel');
      window.location.href = `/apply/boys-hostel/success?trackingNumber=${result.trackingNumber}`;
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      alert(`Failed to submit application: ${error.message || 'Please try again.'}`);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/apply" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                Boys Hostel Application
              </h1>
              <p className="text-caption">Application Form</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/apply" className="nav-link">Apply Now</Link>
            <Link href="/check-status" className="nav-link">Check Status</Link>
            <Link href="/login" className="nav-link">Login</Link>
          </nav>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <FormWizard
            steps={wizardSteps}
            initialData={initialData}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            onSubmitLabel="Submit Application"
          />
        </div>
      </main>
    </div>
  );
}
