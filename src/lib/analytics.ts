// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Pre-defined events for the loan application
export const analytics = {
  // Form events
  formOpened: (source: string) => 
    trackEvent('form_opened', 'Lead Generation', source),
  
  formSubmitted: (loanType?: string) => 
    trackEvent('form_submitted', 'Lead Generation', loanType),
  
  formError: (error: string) => 
    trackEvent('form_error', 'Lead Generation', error),

  // Calculator events
  calculatorUsed: (loanType: string, amount: number) => 
    trackEvent('calculator_used', 'Calculator', loanType, amount),
  
  calculatorSliderChanged: (field: string) => 
    trackEvent('slider_changed', 'Calculator', field),

  // Navigation events
  ctaClicked: (buttonName: string) => 
    trackEvent('cta_clicked', 'Navigation', buttonName),
  
  phoneClicked: () => 
    trackEvent('phone_clicked', 'Contact', 'Header Phone'),
  
  emailClicked: () => 
    trackEvent('email_clicked', 'Contact', 'Email Link'),
  
  whatsappClicked: () => 
    trackEvent('whatsapp_clicked', 'Contact', 'WhatsApp Button'),

  // Page section views
  sectionViewed: (sectionName: string) => 
    trackEvent('section_viewed', 'Engagement', sectionName),

  // External links
  partnerClicked: (partnerName: string) => 
    trackEvent('partner_clicked', 'Partners', partnerName),
  
  socialClicked: (platform: string) => 
    trackEvent('social_clicked', 'Social Media', platform),

  // FAQ interactions
  faqOpened: (question: string) => 
    trackEvent('faq_opened', 'FAQ', question),
};
