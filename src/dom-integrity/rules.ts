import type { Rule } from './types';

// Security rules for DOM Shield
export const securityRules: Rule[] = [
    {
        rule: 'ParanaUserScript',
        execute: () => {
            if (document.querySelector('.gemini-box')) {
                console.log('🚨 DOM Shield: ParanaUserScript detected!');
                console.warn('Potentially suspicious element found: .gemini-box');
            } else {
                console.log('✅ DOM Shield: ParanaUserScript check passed');
            }
        }
    },
    {
        rule: 'SuspiciousScripts',
        execute: () => {
            const scripts = document.querySelectorAll('script[src]');
            const suspiciousDomains = ['suspicious-site.com', 'malware.example'];

            scripts.forEach((script: Element) => {
                const src = (script as HTMLScriptElement).src;
                if (suspiciousDomains.some(domain => src.includes(domain))) {
                    console.warn('🚨 DOM Shield: Suspicious script detected:', src);
                }
            });
        }
    },
    {
        rule: 'IframeDetection',
        execute: () => {
            const iframes = document.querySelectorAll('iframe');
            if (iframes.length > 0) {
                console.log(`🔍 DOM Shield: Found ${iframes.length} iframe(s)`);
                iframes.forEach((iframe: Element, index) => {
                    const src = (iframe as HTMLIFrameElement).src;
                    console.log(`  Iframe ${index + 1}: ${src || 'No src attribute'}`);
                });
            }
        }
    }
];
