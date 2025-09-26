import { execFile } from 'child_process';
import * as path from 'path';

export function runSemgrep(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const rulesPath = path.join(__dirname, "..", "semgrep-rules"); // absolute path

        execFile(
            "semgrep",
            ["--config", rulesPath, "--json", filePath],
            (error, stdout, stderr) => {
                if (stderr) {
                    console.error(`Semgrep stderr: ${stderr}`);
                }

                if (error) {
                    console.error(`Semgrep error: ${error.message}`);
                    reject(error);
                    return;
                }

                try {
                    const parsed = JSON.parse(stdout);
                    resolve(parsed.results || []);
                } catch (err) {
                    console.error("Failed to parse Semgrep JSON output:", err);
                    reject(err);
                }
            }
        );
    });
}