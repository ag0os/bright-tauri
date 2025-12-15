/**
 * Create Element Modal
 *
 * Modal component for creating a new universe element with template selection.
 * Loads suggested attributes from element-templates.json based on selected template.
 */

import { useState, FormEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { useElementsStore } from '@/stores/useElementsStore';
import { useUniverseStore } from '@/stores/useUniverseStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import type { ElementType } from '@/types';
import elementTemplatesData from '@/config/element-templates.json';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';

interface CreateElementModalProps {
  onClose: () => void;
}

interface TemplateData {
  name: string;
  description: string;
  icon: string;
  suggestedAttributes: Array<{
    key: string;
    label: string;
    placeholder: string;
    description: string;
  }>;
}

type TemplateKey = 'character' | 'location' | 'vehicle' | 'item' | 'organization' | 'creature' | 'event' | 'concept';

const templates: Record<TemplateKey, TemplateData> = elementTemplatesData.templates as any;

export function CreateElementModal({ onClose }: CreateElementModalProps) {
  const navigate = useNavigationStore((state) => state.navigate);
  const currentUniverse = useUniverseStore((state) => state.currentUniverse);
  const { createElement } = useElementsStore();

  const [step, setStep] = useState<'select-template' | 'fill-form'>('select-template');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    tags: '',
    color: '',
  });

  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (templateKey: TemplateKey) => {
    setSelectedTemplate(templateKey);
    setStep('fill-form');
  };

  const handleAttributeChange = (key: string, value: string) => {
    setAttributes({ ...attributes, [key]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUniverse) {
      setErrors({ general: 'No universe selected' });
      return;
    }

    if (!selectedTemplate) {
      setErrors({ general: 'No template selected' });
      return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      // Filter out empty attributes
      const filteredAttributes = Object.fromEntries(
        Object.entries(attributes).filter(([_, value]) => value.trim() !== '')
      );

      const element = await createElement({
        universeId: currentUniverse.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        elementType: selectedTemplate as ElementType,
        customTypeName: null,
        details: formData.details.trim() || null,
        attributes: Object.keys(filteredAttributes).length > 0 ? filteredAttributes : null,
        imageUrl: null,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null,
        relationships: null,
        color: formData.color.trim() || null,
        icon: null, // Icons are now determined by element type (Phosphor icons)
      });

      // Navigate to element detail
      navigate({ screen: 'element-detail', elementId: element.id });
      onClose();
    } catch (error) {
      console.error('Failed to create element:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create element',
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('select-template');
    setSelectedTemplate(null);
    setAttributes({});
  };

  const templateData = selectedTemplate ? templates[selectedTemplate] : null;

  return (
    <div
      className="option-1 typo-1 icons-1 button-2 input-5"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-6)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--typography-heading-font)',
              fontSize: 'var(--typography-h3-size)',
              fontWeight: 'var(--typography-h3-weight)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {step === 'select-template' ? 'Choose Element Type' : `Create ${templateData?.name}`}
          </h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close modal"
            style={{ padding: 'var(--spacing-1)' }}
          >
            <X className="icon icon-base" weight="duotone" />
          </button>
        </div>

        {/* Template Selection */}
        {step === 'select-template' && (
          <div
            style={{
              padding: 'var(--spacing-6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--spacing-4)',
            }}
          >
            {(Object.keys(templates) as TemplateKey[]).map((key) => {
              const template = templates[key];
              return (
                <button
                  key={key}
                  className="btn btn-outline btn-base"
                  onClick={() => handleTemplateSelect(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 'var(--spacing-2)',
                    padding: 'var(--spacing-4)',
                    height: 'auto',
                    textAlign: 'center',
                    whiteSpace: 'normal',
                  }}
                >
                  <span style={{ fontSize: '32px', flexShrink: 0 }}>{template.icon}</span>
                  <span
                    style={{
                      fontFamily: 'var(--typography-heading-font)',
                      fontWeight: 'var(--font-weight-semibold)',
                      flexShrink: 0,
                    }}
                  >
                    {template.name}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.4',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}
                  >
                    {template.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Form */}
        {step === 'fill-form' && templateData && (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                padding: 'var(--spacing-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-5)',
              }}
            >
              {/* General Error */}
              {errors.general && (
                <div
                  style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-error-subtle)',
                    color: 'var(--color-error)',
                    borderRadius: '4px',
                    fontFamily: 'var(--typography-body-font)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {errors.general}
                </div>
              )}

              {/* Name (Required) */}
              <div className={`input-group input-5 ${errors.name ? 'has-error' : ''}`}>
                <label className="input-label" htmlFor="element-name">
                  Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="element-name"
                    type="text"
                    className="input-field input-base"
                    placeholder={`e.g., ${templateData.name === 'Character' ? 'John Smith' : templateData.name === 'Location' ? 'Ancient Forest' : 'Example Name'}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                {errors.name && <div className="input-helper">{errors.name}</div>}
              </div>

              {/* Description (Required) */}
              <div className={`input-group input-5 ${errors.description ? 'has-error' : ''}`}>
                <label className="input-label" htmlFor="element-description">
                  Description
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="element-description"
                    className="input-field input-base"
                    placeholder="Brief one-line description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    required
                    style={{
                      resize: 'vertical',
                      minHeight: '60px',
                    }}
                  />
                </div>
                {errors.description && <div className="input-helper">{errors.description}</div>}
              </div>

              {/* Details (Optional) */}
              <div className="input-group input-5">
                <label className="input-label" htmlFor="element-details">
                  Details
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="element-details"
                    className="input-field input-base"
                    placeholder="Longer-form text content and notes"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    rows={4}
                    style={{
                      resize: 'vertical',
                      minHeight: '100px',
                    }}
                  />
                </div>
                <div className="input-helper">Optional detailed information</div>
              </div>

              {/* Suggested Attributes */}
              {templateData.suggestedAttributes.length > 0 && (
                <>
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: 'var(--spacing-4)',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--typography-heading-font)',
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        marginBottom: 'var(--spacing-3)',
                      }}
                    >
                      Suggested Attributes (Optional)
                    </h3>
                    <p
                      style={{
                        fontFamily: 'var(--typography-body-font)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        marginBottom: 'var(--spacing-4)',
                      }}
                    >
                      These attributes are suggestions based on the {templateData.name} template. You can fill in any that are relevant or skip them all.
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 'var(--spacing-4)',
                    }}
                  >
                    {templateData.suggestedAttributes.map((attr) => (
                      <div key={attr.key} className="input-group input-5">
                        <label className="input-label" htmlFor={`attr-${attr.key}`}>
                          {attr.label}
                        </label>
                        <div className="input-wrapper">
                          <input
                            id={`attr-${attr.key}`}
                            type="text"
                            className="input-field input-base"
                            placeholder={attr.placeholder}
                            value={attributes[attr.key] || ''}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                          />
                        </div>
                        {attr.description && (
                          <div className="input-helper">{attr.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Additional Options */}
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--spacing-4)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'var(--spacing-4)',
                }}
              >
                {/* Tags */}
                <div className="input-group input-5">
                  <label className="input-label" htmlFor="element-tags">
                    Tags
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="element-tags"
                      type="text"
                      className="input-field input-base"
                      placeholder="hero, magic, warrior"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                  <div className="input-helper">Comma-separated tags</div>
                </div>

                {/* Color */}
                <div className="input-group input-5">
                  <label className="input-label" htmlFor="element-color">
                    Color
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="element-color"
                      type="text"
                      className="input-field input-base"
                      placeholder="#4F46E5"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="input-helper">Hex color code</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--spacing-3)',
                padding: 'var(--spacing-6)',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-base"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </button>
              <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-base"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Element'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
