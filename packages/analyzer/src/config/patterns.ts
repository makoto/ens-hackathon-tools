export const ENS_PATTERNS = {
  dependencies: {
    '@ensdomains/ensjs': { confidence: 'very_high', type: 'official_sdk', weight: 10 },
    '@ensdomains/thorin': { confidence: 'very_high', type: 'ui_components', weight: 8 },
    '@ensdomains/durin': { confidence: 'very_high', type: 'l2_subdomain', weight: 9 },
    'viem': { confidence: 'high', type: 'modern_library', weight: 7 },
    'wagmi': { confidence: 'high', type: 'react_hooks', weight: 7 },
    'ethers': { confidence: 'medium', type: 'legacy_library', weight: 5 }
  },

  codePatterns: {
    nameResolution: [
      { pattern: /resolveName\(/gi, confidence: 'high', type: 'name_resolution', weight: 8 },
      { pattern: /\.eth['"`\s\)]/gi, confidence: 'medium', type: 'ens_domain', weight: 5 },
      { pattern: /namehash\(/gi, confidence: 'high', type: 'name_resolution', weight: 8 },
      { pattern: /resolver\.getText\(/gi, confidence: 'high', type: 'name_resolution', weight: 7 },
      { pattern: /resolver\.getAddress\(/gi, confidence: 'high', type: 'name_resolution', weight: 7 }
    ],
    
    advanced: [
      { pattern: /CCIP-Read/gi, confidence: 'very_high', type: 'custom_resolver', weight: 10 },
      { pattern: /OffchainLookup/gi, confidence: 'very_high', type: 'custom_resolver', weight: 10 },
      { pattern: /setText\(/gi, confidence: 'high', type: 'text_records', weight: 7 },
      { pattern: /ai\.(bio|context|style)/gi, confidence: 'very_high', type: 'ai_integration', weight: 9 }
    ],
    
    subdomains: [
      { pattern: /(subdomain|subname)/gi, confidence: 'medium', type: 'subdomain_mgmt', weight: 6 },
      { pattern: /NameWrapper/gi, confidence: 'high', type: 'subdomain_mgmt', weight: 8 },
      { pattern: /\bdurin\b/gi, confidence: 'high', type: 'l2_subdomain', weight: 8 },
      { pattern: /@ensdomains\/durin/gi, confidence: 'very_high', type: 'l2_subdomain', weight: 9 },
      { pattern: /durin\.register/gi, confidence: 'very_high', type: 'l2_subdomain', weight: 9 },
      { pattern: /DurinRegistrar/gi, confidence: 'very_high', type: 'l2_subdomain', weight: 9 }
    ]
  },

  contractAddresses: {
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e': { name: 'ENS Registry', confidence: 'very_high', type: 'ens_registry', weight: 10 },
    '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63': { name: 'Public Resolver', confidence: 'very_high', type: 'public_resolver', weight: 9 },
    '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401': { name: 'NameWrapper', confidence: 'very_high', type: 'name_wrapper', weight: 9 }
  }
} as const;