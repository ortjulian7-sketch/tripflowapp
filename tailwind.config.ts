import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        surface: {
          background: 'var(--color-surface-background)',
          elevated: 'var(--color-surface-elevated)',
          secondary: 'var(--color-surface-secondary)',
          selected: 'var(--color-surface-selected)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          brand: 'var(--color-text-brand)',
          inverse: 'var(--color-text-inverse)',
          placeholder: 'var(--color-text-placeholder)',
        },
        icon: {
          brand: 'var(--color-icon-brand)',
          secondary: 'var(--color-icon-secondary)',
        },
        border: {
          brand: 'var(--color-border-brand)',
        },
        action: {
          'primary-default': 'var(--color-action-primary-default)',
          'primary-disabled': 'var(--color-action-primary-disabled)',
        },
        status: {
          success: 'var(--color-status-success)',
          'success-subtle': 'var(--color-status-success-subtle)',
          'success-border': 'var(--color-status-success-border)',
          'success-strong': 'var(--color-status-success-strong)',
          'success-strong-hover': 'var(--color-status-success-strong-hover)',
          'success-on-strong': 'var(--color-status-success-on-strong)',
          warning: 'var(--color-status-warning)',
          'warning-subtle': 'var(--color-status-warning-subtle)',
          'warning-border': 'var(--color-status-warning-border)',
          'warning-strong': 'var(--color-status-warning-strong)',
          'warning-strong-hover': 'var(--color-status-warning-strong-hover)',
          'warning-on-strong': 'var(--color-status-warning-on-strong)',
          error: 'var(--color-status-error)',
          'error-subtle': 'var(--color-status-error-subtle)',
          'error-border': 'var(--color-status-error-border)',
          'error-strong': 'var(--color-status-error-strong)',
          'error-strong-hover': 'var(--color-status-error-strong-hover)',
          'error-on-strong': 'var(--color-status-error-on-strong)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        brand: 'var(--shadow-brand)',
        'brand-glow': 'var(--shadow-brand-glow)',
      },
      borderRadius: {
        button: 'var(--radius-component-button)',
        input: 'var(--radius-component-input)',
        card: 'var(--radius-component-card)',
        full: 'var(--size-full)',
      },
      spacing: {
        'card-padding': 'var(--space-component-card-padding)',
        section: 'var(--space-layout-section)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        brand: ['Catamaran', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
