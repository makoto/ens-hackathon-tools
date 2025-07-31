# ENS Hackathon Tools

A monorepo of tools for analyzing ENS integration in hackathon projects.

## Packages

### [@ens-hackathon/analyzer](./packages/analyzer)
Fast ENS integration analysis for hackathon projects. Analyzes 100+ repositories in under 10 minutes to detect and rate ENS integrations.

**Features:**
- Pattern-based analysis (no LLM required)
- 1-5 star rating system
- Multiple output formats
- CLI and programmatic interfaces

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ensdomains/ens-hackathon-tools.git
cd ens-hackathon-tools

# Install dependencies
npm install

# Build all packages
npm run build

# Run hackathon analyzer
npm run analyze -- analyze -i packages/analyzer/examples/sample-repos.csv -o results.md

# Or test with a single repository
npm run analyze -- single -u https://github.com/aaronjmars/contxdoteth

# Validate input file format
npm run analyze -- validate -i packages/analyzer/examples/sample-repos.csv
```

## Development

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Build specific package
npm run build:analyzer

# Test specific package  
npm run test:analyzer

# Development mode
npm run dev:analyzer
```

## Sample Output

The analyzer produces detailed reports with ratings, evidence, and GitHub links:

```bash
🔍 Analysis Results for aaronjmars/contxdoteth
📊 Rating: ⭐⭐⭐⭐⭐ (5/5)
🎯 Confidence: high
📋 Integration Types: subdomain_mgmt, name_resolution, ai_integration, custom_resolver
💡 Summary: Exceptional ENS integration with custom resolver, AI integration, subdomain management

🔎 Evidence (10 items):
  1. dependency: @ensdomains/ensjs (very_high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/package.json
  2. code: CCIP-Read (very_high)
     📍 https://github.com/aaronjmars/contxdoteth/blob/main/contracts/ContxResolver.sol#L45
  ... and 8 more items
```

**Generated Markdown reports include**:
- 📊 Summary statistics (ENS adoption rate, average rating)
- 🏆 Top-rated projects with detailed breakdowns
- 📋 Integration type analysis (resolvers, subdomains, AI, etc.)
- 📚 Library usage trends (Viem, Wagmi, ENSjs, etc.)
- 🔗 Direct GitHub links to evidence in source code

## Architecture

This monorepo uses:
- **Lerna** for package management
- **TypeScript** for type safety
- **Jest** for testing
- **npm workspaces** for dependency management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes in the appropriate package
4. Add tests
5. Submit a pull request

## Packages Roadmap

- ✅ **analyzer** - Fast ENS integration analysis
- 📋 **reporter** - Enhanced reporting and visualization
- 📋 **pattern-library** - Shared ENS integration patterns
- 📋 **web-dashboard** - Web interface for batch analysis