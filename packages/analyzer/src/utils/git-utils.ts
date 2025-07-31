import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitUtils {
  public async quickClone(repoUrl: string, targetDir: string): Promise<void> {
    try {
      // Shallow clone for speed - only latest commit, single branch
      const command = `git clone --depth 1 --single-branch "${repoUrl}" "${targetDir}"`;
      await execAsync(command, { timeout: 20000 }); // 20s timeout
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async isValidRepository(repoUrl: string): Promise<boolean> {
    try {
      const command = `git ls-remote --heads "${repoUrl}"`;
      await execAsync(command, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  public extractRepoInfo(repoUrl: string): { owner: string; repo: string } | null {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '')
    };
  }
}