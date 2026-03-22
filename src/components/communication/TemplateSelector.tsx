'use client';

import { useRef, useEffect } from 'react';
import { Select, type SelectOption } from '../forms/Select';
import { Textarea } from '../forms/Textarea';

export interface Template {
  id: string;
  name: string;
  content: string;
  variables?: string[];
}

export interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId?: string;
  message: string;
  onTemplateChange: (templateId: string) => void;
  onMessageChange: (message: string) => void;
  label?: string;
  disabled?: boolean;
}

const TemplateSelector = ({
  templates,
  selectedTemplateId,
  message,
  onTemplateChange,
  onMessageChange,
  label = 'Message Template',
  disabled = false,
}: TemplateSelectorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const templateOptions: SelectOption[] = templates.map(template => ({
    value: template.id,
    label: template.name,
  }));

  // Populate message when selectedTemplateId changes
  useEffect(() => {
    if (selectedTemplate && message === '') {
      onMessageChange(selectedTemplate.content);
    }
  }, [selectedTemplateId, selectedTemplate, message, onMessageChange]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.id === e.target.value);
    if (template) {
      onTemplateChange(template.id);
      onMessageChange(template.content);
    }
  };

  const availableVariables = selectedTemplate?.variables || [];

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + `{{${variable}}}` + message.substring(end);

      onMessageChange(newMessage);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  return (
    <div className="space-y-3">
      <Select
        label={label}
        options={templateOptions}
        value={selectedTemplateId}
        onChange={handleTemplateChange}
        placeholder="Select a template"
        disabled={disabled}
        helperText="Templates can be customized after selection"
        data-testid="template-select"
      />

      {availableVariables.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Available variables:</span>
          {availableVariables.map((variable) => (
            <button
              key={variable}
              type="button"
              onClick={() => insertVariable(variable)}
              disabled={disabled}
              className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {`{{${variable}}}`}
            </button>
          ))}
        </div>
      )}

      <Textarea
        label="Message Content"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Type your message or use a template above..."
        rows={6}
        disabled={disabled}
        maxLength={message.startsWith('http') ? 2000 : 500}
        ref={textareaRef}
        data-testid="message-textarea"
      />

      {message.startsWith('http') && (
        <p className="text-xs text-gray-500">
          Email messages support longer content. SMS is limited to 160 characters.
        </p>
      )}
    </div>
  );
};

TemplateSelector.displayName = 'TemplateSelector';

export { TemplateSelector };
