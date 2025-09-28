// Export all DOM Shield functionality
export { 
    securityRules, 
    DOMShieldSecurityObserver, 
    testSecurityObserver, 
    testSpecificRules,
    testGeminiBoxObserver
} from './dom-integrity/rules';

export type { Rule } from './dom-integrity/types';

export { CSPMonitor } from './csp-sentinel/csp';
export type { CSPViolationReport, CSPReportData } from './csp-sentinel/csp';

import { DOMShieldSecurityObserver, testSecurityObserver, testSpecificRules, testGeminiBoxObserver } from './dom-integrity/rules';
import { CSPMonitor } from './csp-sentinel/csp';

export const DOMShield = {
    SecurityObserver: DOMShieldSecurityObserver,
    testSecurityObserver,
    testSpecificRules,
    testGeminiBoxObserver,
    CSPMonitor
};

