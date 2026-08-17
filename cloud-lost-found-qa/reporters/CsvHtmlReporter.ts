import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class CsvHtmlReporter implements Reporter {
  private results: any[] = [];
  private outputDir = path.join(process.cwd(), 'output');

  onBegin(config, suite) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const titleRegex = /^\[([^\]]+)\]\s+(.*)/;
    const match = test.title.match(titleRegex);
    const id = match ? match[1] : 'UNKNOWN';
    const desc = match ? match[2] : test.title;
    
    let status = result.status.toUpperCase();
    if (status === 'SKIPPED') {
      status = 'BLOCKED';
    }

    let classification = '';
    if (status === 'FAIL' || status === 'TIMEDOUT') {
      const errorMsg = result.error ? result.error.message.split('\n')[0] : 'Timeout';
      if (errorMsg.includes('Timeout')) {
        classification = 'QA Bug (Locator Mismatch) or App Bug (Performance)';
      } else if (errorMsg.includes('expected')) {
        classification = 'App Bug (Assertion Failed)';
      } else {
        classification = 'Env Limitation or App Bug';
      }
    }

    this.results.push({
      id,
      area: test.parent.title || 'General',
      test: desc,
      status: status === 'TIMEDOUT' ? 'FAIL' : status,
      duration: result.duration,
      classification: classification,
      error: result.error ? result.error.message.split('\n')[0] : ''
    });
  }

  onEnd(result: FullResult) {
    const csvPath = path.join(this.outputDir, 'qa-results.csv');
    const htmlPath = path.join(this.outputDir, 'qa-summary.html');

    let csvContent = 'ID,Area,Test,Status,Classification,Duration(ms),Error\n';
    for (const r of this.results) {
      csvContent += `${r.id},"${r.area}","${r.test}",${r.status},"${r.classification}",${r.duration},"${r.error}"\n`;
    }
    fs.writeFileSync(csvPath, csvContent);

    let htmlContent = `
    <html>
      <head>
        <title>Expanded QA Summary Report</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .PASS { color: green; font-weight: bold; }
          .FAIL { color: red; font-weight: bold; }
          .BLOCKED { color: orange; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Cloud Lost & Found QA Summary</h1>
        <p>Total Tests: ${this.results.length}</p>
        <table>
          <tr>
            <th>ID</th>
            <th>Area</th>
            <th>Test</th>
            <th>Status</th>
            <th>Classification</th>
            <th>Notes</th>
          </tr>
    `;

    for (const r of this.results) {
      htmlContent += `
          <tr>
            <td>${r.id}</td>
            <td>${r.area}</td>
            <td>${r.test}</td>
            <td class="${r.status}">${r.status}</td>
            <td>${r.classification}</td>
            <td>${r.error}</td>
          </tr>
      `;
    }

    htmlContent += `
        </table>
      </body>
    </html>
    `;
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`\nQA Reports generated at ${this.outputDir}\n`);
  }
}

export default CsvHtmlReporter;
