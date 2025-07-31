# @ens-hackathon/analyzer

Fast ENS integration analysis for hackathon projects. Analyzes repositories to detect and rate ENS integrations.

## Installation

```bash
# Install globally
npm install -g @ens-hackathon/analyzer

# Or use in project
npm install @ens-hackathon/analyzer
```

## CLI Usage

```bash
# Analyze from CSV file
ens-hackathon-analyzer analyze -i projects.csv -o results.md

# Analyze single repository
ens-hackathon-analyzer single -u https://github.com/user/project

# Custom configuration
ens-hackathon-analyzer analyze -i projects.csv -c 5 -t 60 -o results.md

# JSON output
ens-hackathon-analyzer analyze -i projects.csv --json -o results.json

# Validate input file
ens-hackathon-analyzer validate -i projects.csv
```

## Programmatic Usage

```typescript
import { ENSHackathonAnalyzer } from '@ens-hackathon/analyzer';

const analyzer = new ENSHackathonAnalyzer();

// Analyze single repository
const result = await analyzer.analyzeSingle('https://github.com/user/project');

// Analyze batch
const repos = ['https://github.com/user/project1', 'https://github.com/user/project2'];
const batchResult = await analyzer.analyzeBatch(repos);

// Generate report
const report = analyzer.generateReport(batchResult);
```

## Features

- **Fast Analysis**: 100 projects in ~10 minutes
- **Pattern Detection**: Dependencies, code patterns, smart contracts  
- **Star Rating**: 1-5 star quality assessment
- **Multiple Formats**: Markdown reports, JSON output
- **Integration Types**: Detects 11 different ENS integration patterns

## Integration Types Detected

- **Name Resolution** - Basic ENS name-to-address resolution
- **Subdomain Management** - Creating and managing subdomains/subnames
- **Profile Display** - Showing ENS profiles, avatars, text records
- **Authentication** - Using ENS for login and identity verification
- **Smart Contract Integration** - Direct contract interactions with ENS
- **Cross-chain/L2** - Multi-chain ENS functionality
- **Content Hosting** - IPFS/decentralized content via ENS
- **Text Records** - Custom metadata and structured data
- **AI Integration** - AI agents and context storage in ENS
- **Custom Resolvers** - CCIP-Read and advanced resolver patterns
- **L2 Subdomains** - Layer 2 subdomain systems (e.g., Durin)

## Input File Format

### CSV Format
```csv
project_name,repository_url,description
Contx.eth,https://github.com/aaronjmars/contxdoteth,AI identity conversion
Substream,https://github.com/blackicon-eth/substream-frontend,Payment streaming
```

### JSON Format
```json
{
  "repositories": [
    "https://github.com/user/project1",
    "https://github.com/user/project2"
  ]
}
```

## Configuration Options

```bash
# Concurrent analysis (default: 10)
-c, --concurrent <number>

# Timeout per repository (default: 30s)
-t, --timeout <number>

# Output format
--json                    # JSON instead of Markdown

# Input validation
ens-hackathon-analyzer validate -i input.csv
```

## Example Output

### Single Repository Analysis
```bash
🔍 Analysis Results for aaronjmars/contxdoteth
📊 Rating: ⭐⭐⭐⭐⭐ (5/5)
🎯 Confidence: high
📋 Integration Types: subdomain_mgmt, name_resolution, ai_integration, custom_resolver
💡 Summary: Exceptional ENS integration with custom resolver, AI integration, subdomain management, name resolution
⏱️  Duration: 1015ms

🔎 Evidence (10 items):
  1. dependency: @ensdomains/ensjs (very_high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/package.json
  2. dependency: viem (high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/package.json
  3. code: CCIP-Read (very_high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/contracts/ContxResolver.sol#L45
  4. code: ai.context (very_high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/src/lib/ens.ts#L156
  5. code: setText( (high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/src/components/RegistrationFlow.tsx#L78
  ... and 5 more items
```

### JSON Output Format
```bash
ens-hackathon-analyzer single -u https://github.com/aaronjmars/contxdoteth --json
```

```json
{
  "repository": "aaronjmars/contxdoteth",
  "url": "https://github.com/aaronjmars/contxdoteth",
  "hasENS": true,
  "confidence": "high",
  "rating": 5,
  "integrationTypes": [
    "subdomain_mgmt",
    "name_resolution", 
    "ai_integration",
    "custom_resolver"
  ],
  "evidence": [
    {
      "type": "dependency",
      "pattern": "@ensdomains/ensjs",
      "file": "package.json",
      "line": 0,
      "confidence": "very_high",
      "integrationType": "official_sdk",
      "weight": 10,
      "context": "\"@ensdomains/ensjs\": \"^3.0.0\"",
      "githubUrl": "https://github.com/aaronjmars/contxdoteth/blob/main/package.json"
    },
    {
      "type": "code",
      "pattern": "CCIP-Read",
      "file": "contracts/ContxResolver.sol",
      "line": 45,
      "confidence": "very_high",
      "integrationType": "custom_resolver",
      "weight": 10,
      "context": "function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {",
      "matchedText": "CCIP-Read",
      "githubUrl": "https://github.com/aaronjmars/contxdoteth/blob/main/contracts/ContxResolver.sol#L45"
    },
    {
      "type": "code",
      "pattern": "ai.context",
      "file": "src/lib/ens.ts",
      "line": 156,
      "confidence": "very_high",
      "integrationType": "ai_integration",
      "weight": 9,
      "context": "await resolver.setText(node, 'ai.context', contextData);",
      "matchedText": "ai.context",
      "githubUrl": "https://github.com/aaronjmars/contxdoteth/blob/main/src/lib/ens.ts#L156"
    }
  ],
  "summary": "Exceptional ENS integration with custom resolver, AI integration, subdomain management, name resolution",
  "timestamp": "2025-07-31T08:39:37.120Z",
  "duration": 1015
}
```

### Batch Analysis Progress
```bash
🚀 Starting analysis of 26 repositories...
📦 Processing chunk 1/3 (10 repos)
🔍 Analyzing aarojmars/contxdoteth...
✓ aaronjmars/contxdoteth: 5⭐ (1,015ms)
🔍 Analyzing blackicon-eth/substream-frontend...
✓ blackicon-eth/substream-frontend: 4⭐ (2,341ms)
🔍 Analyzing YofiY/exzek...
✓ YofiY/exzek: 3⭐ (1,876ms)
✅ Completed 24/26 analyses in 87.3s
📈 Found 18/24 ENS projects (75%)
⭐ Average rating: 2.8/5
```

### Sample Markdown Report
```markdown
# ENS Hackathon Analysis Report
*Generated on 2025-07-31 at 08:39*

## 📊 Summary
- **Total Projects**: 26
- **ENS Integration Found**: 18/26 (69.2%)
- **Average Rating**: 2.8/5 ⭐
- **Analysis Duration**: 87.3 seconds

## 🏆 Top Projects

### ⭐⭐⭐⭐⭐ Contx.eth (5/5)
**Repository**: https://github.com/aaronjmars/contxdoteth  
**Integration Types**: subdomain_mgmt, name_resolution, ai_integration, custom_resolver  
**Summary**: Exceptional ENS integration with custom resolver, AI integration, subdomain management, name resolution  

**Key Evidence**:
- ✅ @ensdomains/ensjs dependency (very_high confidence)
- ✅ CCIP-Read custom resolver implementation
- ✅ AI context storage in ENS text records
- ✅ Dynamic subdomain assignment system

### ⭐⭐⭐⭐ Substream (4/5)
**Repository**: https://github.com/blackicon-eth/substream-frontend  
**Integration Types**: name_resolution, subdomain_mgmt  
**Summary**: Advanced ENS integration with payment streaming to ENS names  

## 📋 Integration Type Breakdown
- **Name Resolution**: 15 projects (83%)
- **Subdomain Management**: 8 projects (44%)
- **Profile Display**: 12 projects (67%)
- **Custom Resolvers**: 3 projects (17%)
- **AI Integration**: 2 projects (11%)

## 📚 Library Usage
- **Viem**: 11 projects (61%)
- **Wagmi**: 8 projects (44%)
- **ENSjs**: 6 projects (33%)
- **Ethers.js**: 4 projects (22%)
```

### Batch JSON Output
```bash
ens-hackathon-analyzer analyze -i projects.csv --json -o results.json
```

```json
{
  "results": [
    {
      "repository": "aaronjmars/contxdoteth",
      "url": "https://github.com/aaronjmars/contxdoteth",
      "hasENS": true,
      "confidence": "high",
      "rating": 5,
      "integrationTypes": ["subdomain_mgmt", "name_resolution", "ai_integration"],
      "evidence": [...],
      "summary": "Exceptional ENS integration with custom resolver...",
      "timestamp": "2025-07-31T08:39:37.120Z",
      "duration": 1015
    },
    {
      "repository": "blackicon-eth/substream-frontend", 
      "url": "https://github.com/blackicon-eth/substream-frontend",
      "hasENS": true,
      "confidence": "high",
      "rating": 4,
      "integrationTypes": ["name_resolution", "subdomain_mgmt"],
      "evidence": [...],
      "summary": "Advanced ENS integration with payment streaming...",
      "timestamp": "2025-07-31T08:39:38.341Z",
      "duration": 2341
    }
  ],
  "summary": {
    "totalRepositories": 26,
    "ensProjects": 18,
    "ensPercentage": 69.2,
    "averageRating": 2.8,
    "totalDuration": 87300,
    "integrationTypeStats": {
      "name_resolution": 15,
      "subdomain_mgmt": 8,
      "profile_display": 12,
      "custom_resolver": 3,
      "ai_integration": 2
    },
    "libraryStats": {
      "viem": 11,
      "wagmi": 8,
      "@ensdomains/ensjs": 6,
      "ethers": 4
    }
  },
  "timestamp": "2025-07-31T08:39:37.120Z",
  "total": 26
}
```

## Star Rating System

- **⭐ Basic** (1 star): Simple name resolution or basic ENS usage
- **⭐⭐ Good** (2 stars): Multiple features, proper implementation
- **⭐⭐⭐ Excellent** (3 stars): Advanced features, official libraries
- **⭐⭐⭐⭐ Prize-worthy** (4 stars): Novel use cases, multiple advanced features
- **⭐⭐⭐⭐⭐ Exceptional** (5 stars): Revolutionary applications, custom resolvers

## Library Detection

The analyzer detects usage of:
- **[Viem](https://viem.sh)** - Modern TypeScript Ethereum library
- **[Wagmi](https://wagmi.sh)** - React hooks for Ethereum
- **[ENSjs](https://github.com/ensdomains/ensjs)** - Official ENS JavaScript library
- **[Thorin](https://thorin.ens.domains)** - ENS design system
- **[Durin](https://github.com/ensdomains/durin)** - L2 subdomain registrar
- **[Ethers.js](https://ethers.org)** - Ethereum library

### Adding New Detection Patterns

To extend the analyzer with new libraries or code patterns, modify the pattern configuration files:

#### 1. Adding New Dependencies

Edit `src/config/patterns.ts` to add new package dependencies:

```typescript
export const ENS_PATTERNS = {
  dependencies: {
    // Existing patterns...
    '@ensdomains/ensjs': { confidence: 'very_high', type: 'official_sdk', weight: 10 },
    
    // Add new library
    '@rainbow-me/rainbowkit': { confidence: 'high', type: 'wallet_ui', weight: 6 },
    '@web3modal/ethereum': { confidence: 'medium', type: 'wallet_modal', weight: 5 },
    'use-ens': { confidence: 'high', type: 'react_hook', weight: 7 }
  }
  // ...
}
```

**Parameters:**
- `confidence`: `'very_high'` | `'high'` | `'medium'` | `'low'`
- `type`: Semantic category (used for grouping in reports)
- `weight`: Numeric weight for scoring (1-10, higher = more important)

#### 2. Adding Code Patterns

Add regex patterns to detect specific code usage:

```typescript
export const ENS_PATTERNS = {
  // ...
  codePatterns: {
    nameResolution: [
      // Existing patterns...
      { pattern: /resolveName\(/gi, confidence: 'high', type: 'name_resolution', weight: 8 },
      
      // Add new patterns
      { pattern: /useEns\(/gi, confidence: 'high', type: 'react_hook', weight: 7 },
      { pattern: /\.reverse\(\)/gi, confidence: 'high', type: 'reverse_resolution', weight: 7 }
    ],
    
    // Add new pattern category
    l2Integration: [
      { pattern: /arbitrum.*ens/gi, confidence: 'medium', type: 'l2_integration', weight: 6 },
      { pattern: /optimism.*ens/gi, confidence: 'medium', type: 'l2_integration', weight: 6 }
    ]
  }
}
```

**Pattern Guidelines:**
- Use word boundaries (`\b`) to avoid false positives
- Include the `i` flag for case-insensitive matching
- Test patterns against common false positives
- Use specific contexts when possible (e.g., `resolver\.getText\(`)

#### 3. Adding Contract Addresses

Detect interaction with specific smart contracts:

```typescript
export const ENS_PATTERNS = {
  // ...
  contractAddresses: {
    // Existing addresses...
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e': { 
      name: 'ENS Registry', 
      confidence: 'very_high', 
      type: 'ens_registry', 
      weight: 10 
    },
    
    // Add new contract addresses
    '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85': {
      name: 'ENS Base Registrar',
      confidence: 'very_high',
      type: 'registrar',
      weight: 9
    }
  }
}
```

#### 4. Pattern Validation

The analyzer includes validation to reduce false positives. To add custom validation:

Edit `src/detectors/code-detector.ts`:

```typescript
private isValidMatch(match: string, line: string, originalPattern: string): boolean {
  // Existing validation...
  
  // Add custom validation for new patterns
  if (originalPattern.includes('useEns')) {
    // Only match in import statements or function calls
    return /^(import|.*useEns\s*\()/.test(line.trim());
  }
  
  return true;
}
```

#### 5. Testing New Patterns

Create test cases in `src/__tests__/`:

```typescript
describe('New Pattern Detection', () => {
  it('should detect RainbowKit usage', () => {
    const mockFile = {
      path: 'package.json',
      content: '{"dependencies": {"@rainbow-me/rainbowkit": "^1.0.0"}}',
      size: 100,
      extension: '.json'
    };
    
    const evidence = detector.detect([mockFile]);
    expect(evidence).toContainPattern('@rainbow-me/rainbowkit');
  });
});
```

#### 6. Integration Type Mapping

Update the classifier to handle new integration types in `src/core/classifier.ts`:

```typescript
private getIntegrationTypes(evidence: Evidence[]): string[] {
  const types = new Set<string>();
  
  evidence.forEach(e => {
    // Existing mappings...
    if (e.integrationType === 'wallet_ui') types.add('wallet_integration');
    if (e.integrationType === 'l2_integration') types.add('cross_chain');
  });
  
  return Array.from(types);
}
```

#### Best Practices

1. **Start with High-Confidence Patterns**: Begin with obvious, specific patterns
2. **Test Against Real Repositories**: Validate against known projects
3. **Consider Context**: Use surrounding code context to reduce false positives
4. **Weight Appropriately**: Official ENS tools should have higher weights
5. **Document New Types**: Update integration type documentation
6. **Version Control**: Test pattern changes against existing test suite

#### Example: Adding Farcaster ENS Integration

```typescript
// In patterns.ts
dependencies: {
  '@farcaster/hub-nodejs': { confidence: 'medium', type: 'farcaster_integration', weight: 6 }
},

codePatterns: {
  social: [
    { pattern: /farcaster.*ens/gi, confidence: 'high', type: 'social_integration', weight: 7 },
    { pattern: /\.fid\b/gi, confidence: 'medium', type: 'farcaster_id', weight: 5 }
  ]
}
```

This system allows the analyzer to evolve with the ENS ecosystem as new tools and integration patterns emerge.

## Performance

- **Speed**: ~3-6 seconds per repository
- **Concurrency**: 10 repositories processed simultaneously
- **Memory**: ~100MB peak usage for 100 projects
- **Success Rate**: ~95% (accounting for private/deleted repos)

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Test  
npm run test

# Lint
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.