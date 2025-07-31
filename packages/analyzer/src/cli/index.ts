#!/usr/bin/env node

import { Command } from 'commander';
import { ENSHackathonAnalyzer } from '../core/analyzer';
import { InputParser } from './input-parser';
import * as fs from 'fs';

const program = new Command();

program
  .name('ens-hackathon-analyzer')
  .description('Analyze hackathon projects for ENS integration')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze repositories from CSV file')
  .requiredOption('-i, --input <file>', 'Input CSV file with repository URLs')
  .option('-o, --output <file>', 'Output file (default: ens-analysis-{timestamp}.md)')
  .option('-c, --concurrent <number>', 'Max concurrent analyses (default: 10)', '10')
  .option('-t, --timeout <number>', 'Timeout per repo in seconds (default: 30)', '30')
  .option('--json', 'Output in JSON format')
  .action(async (options) => {
    try {
      const inputParser = new InputParser();
      const repoUrls = await inputParser.parseCSV(options.input);
      
      console.log(`📊 Found ${repoUrls.length} repositories to analyze`);
      
      const analyzer = new ENSHackathonAnalyzer();
      analyzer.setConfig({
        maxConcurrent: parseInt(options.concurrent),
        timeoutMs: parseInt(options.timeout) * 1000,
        maxFileSize: 100 * 1024, // 100KB
        maxFilesPerRepo: 50,
        skipBinaryFiles: true,
        ignoreDirs: ['node_modules', 'target', '.git', 'dist', 'build'],
        enableLogging: true
      });
      
      const results = await analyzer.analyzeBatch(repoUrls);
      
      const timestamp = Date.now();
      const outputFile = options.output || `ens-analysis-${timestamp}.md`;
      
      if (options.json) {
        const jsonOutput = JSON.stringify(results, null, 2);
        const jsonFile = outputFile.replace(/\.md$/, '.json');
        fs.writeFileSync(jsonFile, jsonOutput);
        console.log(`✅ JSON results saved to ${jsonFile}`);
      } else {
        const report = analyzer.generateReport(results);
        fs.writeFileSync(outputFile, report);
        console.log(`✅ Analysis complete! Report saved to ${outputFile}`);
      }
      
      console.log(`📈 Found ${results.summary.ensProjects}/${results.total} ENS projects (${results.summary.ensPercentage}%)`);
      console.log(`⭐ Average rating: ${results.summary.averageRating.toFixed(1)}/5`);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('single')
  .description('Analyze a single repository')
  .requiredOption('-u, --url <url>', 'Repository URL')
  .option('--json', 'Output in JSON format')
  .action(async (options) => {
    try {
      const analyzer = new ENSHackathonAnalyzer();
      const result = await analyzer.analyzeSingle(options.url);
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n🔍 Analysis Results for ${result.repository}`);
        console.log(`📊 Rating: ${'⭐'.repeat(result.rating)} (${result.rating}/5)`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📋 Integration Types: ${result.integrationTypes.join(', ')}`);
        console.log(`💡 Summary: ${result.summary}`);
        console.log(`⏱️  Duration: ${result.duration}ms`);
        
        if (result.evidence.length > 0) {
          console.log(`\n🔎 Evidence (${result.evidence.length} items):`);
          result.evidence.slice(0, 5).forEach((evidence, index) => {
            const location = evidence.githubUrl || `${evidence.file}:${evidence.line}`;
            console.log(`  ${index + 1}. ${evidence.type}: ${evidence.pattern} (${evidence.confidence})`);
            console.log(`     📍 ${location}`);
          });
          if (result.evidence.length > 5) {
            console.log(`  ... and ${result.evidence.length - 5} more items`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate input file format')
  .requiredOption('-i, --input <file>', 'Input CSV file to validate')
  .action(async (options) => {
    try {
      const inputParser = new InputParser();
      const repoUrls = await inputParser.parseCSV(options.input);
      
      console.log(`✅ Input file is valid`);
      console.log(`📊 Found ${repoUrls.length} repository URLs`);
      
      // Show first 5 URLs as sample
      console.log(`\n📋 Sample URLs:`);
      repoUrls.slice(0, 5).forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
      
      if (repoUrls.length > 5) {
        console.log(`  ... and ${repoUrls.length - 5} more`);
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();