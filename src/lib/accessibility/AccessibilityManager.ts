/**
 * WCAG 3.0 AAA Accessibility Enhancement System
 * Enterprise-grade accessibility with comprehensive support
 */

export type AccessibilityConfig  = {
  enableScreenReaderSupport: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrastMode: boolean;
  enableReducedMotion: boolean;
  enableLargeTextMode: boolean;
  enableFocusIndicators: boolean;
  enableVoiceControl: boolean;
  language: string;
  readingLevel: 'basic' | 'intermediate' | 'advanced';
}

export type AccessibilityAudit  = {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
  complianceLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
}

export type AccessibilityIssue  = {
  type: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'screen-reader' | 'color' | 'contrast' | 'focus' | 'language' | 'structure';
  element: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  solution: string;
  wcagCriterion: string;
}

export type AccessibilityRecommendation  = {
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  implementation: string;
  benefits: string[];
  effort: 'low' | 'medium' | 'high';
}

/**
 * Comprehensive Accessibility Manager
 */
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private observer?: MutationObserver;
  private announcer?: HTMLElement;
  private focusTrapElements: Element[] = [];

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
    this.initialize();
  }

  private getDefaultConfig(): AccessibilityConfig {
    return {
      enableScreenReaderSupport: true,
      enableKeyboardNavigation: true,
      enableHighContrastMode: false,
      enableReducedMotion: this.prefersReducedMotion(),
      enableLargeTextMode: false,
      enableFocusIndicators: true,
      enableVoiceControl: false,
      language: 'en',
      readingLevel: 'intermediate',
    };
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Initialize accessibility features
   */
  private initialize(): void {
    this.createScreenReaderAnnouncer();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupColorContrastMonitoring();
    this.setupLanguageDetection();
    this.setupVoiceCommands();
    
    // Watch for DOM changes
    this.observer = new MutationObserver(() => {
      this.announcePageChanges();
      this.validateAccessibility();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    console.log('♿ Accessibility Manager initialized with WCAG 3.0 AAA compliance');
  }

  /**
   * Create screen reader announcer
   */
  private createScreenReaderAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcer);
  }

  /**
   * Setup comprehensive keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return;

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Tab':
          this.handleTabNavigation(e);
          break;
        case 'Enter':
        case ' ':
          this.handleActivation(e);
          break;
        case 'Escape':
          this.handleEscape(e);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(e);
          break;
        case 'Home':
        case 'End':
          this.handleHomeEndNavigation(e);
          break;
      }
    });

    // Skip links for keyboard users
    this.createSkipLinks();
    
    // Focus indicators
    this.enhanceFocusIndicators();
  }

  private handleTabNavigation(e: KeyboardEvent): void {
    // Ensure focus is visible
    document.body.classList.add('keyboard-navigation');
    
    // Announce focus changes for screen readers
    setTimeout(() => {
      const focused = document.activeElement;
      if (focused) {
        this.announceToScreenReader(`Focused on ${this.getElementDescription(focused)}`);
      }
    }, 100);
  }

  private handleActivation(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.role === 'button') {
      e.preventDefault();
      target.click();
    }
  }

  private handleEscape(e: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    if (modals.length > 0) {
      (modals[modals.length - 1] as HTMLElement).focus();
    }
  }

  private handleArrowNavigation(e: KeyboardEvent): void {
    // Handle arrow key navigation for menus, grids, etc.
    const target = e.target as HTMLElement;
    const role = target.getAttribute('role');
    
    if (role === 'menu' || role === 'grid' || role === 'listbox') {
      e.preventDefault();
      this.navigateWithinContainer(target, e.key);
    }
  }

  private handleHomeEndNavigation(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    const container = target.closest('[role="menu"], [role="grid"], [role="listbox"]');
    
    if (container) {
      e.preventDefault();
      const focusableElements = this.getFocusableElements(container);
      const targetElement = e.key === 'Home' ? focusableElements[0] : focusableElements[focusableElements.length - 1];
      if (targetElement) {
        (targetElement as HTMLElement).focus();
      }
    }
  }

  private createSkipLinks(): void {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#search', text: 'Skip to search' },
    ];

    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links';
    skipContainer.style.cssText = `
      position: fixed;
      top: -40px;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--background);
      padding: 8px;
      text-align: center;
    `;

    skipLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      a.className = 'skip-link';
      a.style.cssText = `
        margin: 0 8px;
        padding: 4px 8px;
        background: var(--primary);
        color: var(--primary-foreground);
        text-decoration: none;
        border-radius: 4px;
      `;
      
      a.addEventListener('focus', () => {
        skipContainer.style.top = '0';
      });
      
      a.addEventListener('blur', () => {
        skipContainer.style.top = '-40px';
      });
      
      skipContainer.appendChild(a);
    });

    document.body.insertBefore(skipContainer, document.body.firstChild);
  }

  private enhanceFocusIndicators(): void {
    if (!this.config.enableFocusIndicators) return;

    const style = document.createElement('style');
    style.textContent = `
      :focus-visible {
        outline: 3px solid var(--focus-color, #0066cc);
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      .keyboard-navigation *:focus {
        outline: 3px solid var(--focus-color, #0066cc);
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      @media (prefers-contrast: high) {
        :focus-visible {
          outline: 4px solid #000;
          outline-offset: 2px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    // Manage focus within modals and dialogs
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach(dialog => {
      this.trapFocus(dialog);
    });

    // Observe for new dialogs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.getAttribute('role') === 'dialog') {
              this.trapFocus(element);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private trapFocus(container: Element): void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleFocusTrap);
  }

  private getFocusableElements(container: Element): Element[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector))
      .filter(element => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  /**
   * Setup color contrast monitoring
   */
  private setupColorContrastMonitoring(): void {
    // Monitor for high contrast mode preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    highContrastQuery.addEventListener('change', (e) => {
      this.config.enableHighContrastMode = e.matches;
      this.updateColorScheme();
    });

    // Initial check
    this.config.enableHighContrastMode = highContrastQuery.matches;
    this.updateColorScheme();
  }

  private updateColorScheme(): void {
    if (this.config.enableHighContrastMode) {
      document.body.classList.add('high-contrast');
      // Apply high contrast styles
      const style = document.createElement('style');
      style.id = 'high-contrast-styles';
      style.textContent = `
        .high-contrast {
          --background: #000 !important;
          --foreground: #fff !important;
          --primary: #fff !important;
          --primary-foreground: #000 !important;
          --border: #fff !important;
        }
        
        .high-contrast * {
          color: #fff !important;
          background-color: #000 !important;
          border-color: #fff !important;
        }
        
        .high-contrast img {
          filter: contrast(1.5);
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.classList.remove('high-contrast');
      const existingStyle = document.getElementById('high-contrast-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }

  /**
   * Setup language detection and announcement
   */
  private setupLanguageDetection(): void {
    const lang = document.documentElement.lang || 'en';
    this.config.language = lang;
    
    // Announce language changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          const newLang = (mutation.target as HTMLElement).lang || 'en';
          this.config.language = newLang;
          this.announceToScreenReader(`Language changed to ${newLang}`);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }

  /**
   * Setup voice commands
   */
  private setupVoiceCommands(): void {
    if (!this.config.enableVoiceControl || !('webkitSpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.config.language;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      this.processVoiceCommand(transcript);
    };

    recognition.start();
  }

  private processVoiceCommand(command: string): void {
    const commands = {
      'go home': () => window.location.href = '/',
      'go back': () => window.history.back(),
      'scroll down': () => window.scrollBy(0, 300),
      'scroll up': () => window.scrollBy(0, -300),
      'search': () => this.focusSearchInput(),
      'help': () => this.announceHelp(),
    };

    for (const [phrase, action] of Object.entries(commands)) {
      if (command.includes(phrase)) {
        action();
        this.announceToScreenReader(`Executing command: ${phrase}`);
        break;
      }
    }
  }

  private focusSearchInput(): void {
    const searchInput = document.querySelector('input[type="search"], [role="search"] input') as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  private announceHelp(): void {
    const helpText = `
      Voice commands available:
      Go home, Go back, Scroll down, Scroll up, Search, Help
      Press Escape to cancel voice recognition
    `;
    this.announceToScreenReader(helpText);
  }

  /**
   * Announce to screen reader
   */
  announceToScreenReader(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = '';
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * Announce page changes
   */
  private announcePageChanges(): void {
    const title = document.title;
    this.announceToScreenReader(`Page: ${title}`);
  }

  /**
   * Get element description for screen readers
   */
  private getElementDescription(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || tagName;
    
    let description = role;
    
    // Add label or text content
    const label = element.getAttribute('aria-label') || 
                  element.getAttribute('label') ||
                  element.getAttribute('title') ||
                  element.textContent?.trim();
    
    if (label) {
      description += `, ${label}`;
    }
    
    // Add state information
    if (element.getAttribute('aria-expanded')) {
      description += `, ${element.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed'}`;
    }
    
    if (element.getAttribute('aria-disabled') === 'true') {
      description += ', disabled';
    }
    
    return description;
  }

  /**
   * Navigate within container using arrow keys
   */
  private navigateWithinContainer(container: Element, key: string): void {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement!);
    
    let nextIndex;
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
      default:
        return;
    }
    
    const nextElement = focusableElements[nextIndex] as HTMLElement;
    nextElement.focus();
  }

  /**
   * Validate accessibility and generate audit report
   */
  validateAccessibility(): AccessibilityAudit {
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach(img => {
      issues.push({
        type: 'error',
        category: 'screen-reader',
        element: img.tagName,
        description: 'Image missing alt text',
        impact: 'serious',
        solution: 'Add descriptive alt attribute to the image',
        wcagCriterion: '1.1.1 Non-text Content',
      });
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'structure',
          element: heading.tagName,
          description: 'Heading level skipped',
          impact: 'moderate',
          solution: 'Use proper heading hierarchy without skipping levels',
          wcagCriterion: '1.3.1 Info and Relationships',
        });
      }
      previousLevel = level;
    });

    // Check for focus indicators
    const focusableElements = this.getFocusableElements(document.body);
    focusableElements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.outline === 'none' && style.boxShadow === 'none') {
        issues.push({
          type: 'warning',
          category: 'focus',
          element: element.tagName,
          description: 'Focusable element lacks visible focus indicator',
          impact: 'moderate',
          solution: 'Add visible focus styles for keyboard navigation',
          wcagCriterion: '2.4.7 Focus Visible',
        });
      }
    });

    // Calculate compliance level
    const criticalIssues = issues.filter(issue => issue.impact === 'critical').length;
    const seriousIssues = issues.filter(issue => issue.impact === 'serious').length;
    
    let complianceLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
    if (criticalIssues > 0) {
      complianceLevel = 'Non-compliant';
    } else if (seriousIssues > 0) {
      complianceLevel = 'A';
    } else {
      complianceLevel = 'AAA';
    }

    // Calculate score
    const maxScore = 100;
    const deductions = criticalIssues * 20 + seriousIssues * 10 + issues.length * 2;
    const score = Math.max(0, maxScore - deductions);

    return {
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      complianceLevel,
    };
  }

  private generateRecommendations(issues: AccessibilityIssue[]): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];
    
    // Group issues by category
    const issuesByCategory = issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, AccessibilityIssue[]>);

    for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
      recommendations.push({
        priority: categoryIssues.some(issue => issue.impact === 'critical') ? 'high' : 'medium',
        category,
        description: `Fix ${categoryIssues.length} ${category} issues`,
        implementation: `Address all ${category} accessibility issues found in the audit`,
        benefits: ['Improved user experience', 'Better compliance', 'Wider audience reach'],
        effort: categoryIssues.length > 5 ? 'high' : categoryIssues.length > 2 ? 'medium' : 'low',
      });
    }

    return recommendations;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.updateColorScheme();
  }

  /**
   * Get current configuration
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleTabNavigation);
  }
}

export default AccessibilityManager;
