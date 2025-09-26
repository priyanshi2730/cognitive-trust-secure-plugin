import * as vscode from 'vscode';
import { runSemgrep } from './semgrepRunner';

const diagnosticCollection = vscode.languages.createDiagnosticCollection("cognitiveTrust");

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(diagnosticCollection);

    // Run Semgrep whenever a file is saved
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId === 'python' || document.languageId === 'javascript') {
            await scanDocument(document);
        }
    });

    // Manual "Run Semgrep Scan" command
    const runScanCommand = vscode.commands.registerCommand("cognitiveTrust.runScan", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor to scan.");
            return;
        }
        await scanDocument(editor.document);
        vscode.window.showInformationMessage("Semgrep scan complete. Check Problems tab.");
    });
    context.subscriptions.push(runScanCommand);

    // Provide code actions (Quick Fixes)
    const codeActionProvider: vscode.CodeActionProvider = {
        provideCodeActions(document, range, context) {
            return context.diagnostics.map(diagnostic => {
                if (diagnostic.message.includes("hardcoded-secret")) {
                    const fix = new vscode.CodeAction(
                        "Replace with env variable",
                        vscode.CodeActionKind.QuickFix
                    );
                    fix.command = {
                        command: "cognitiveTrust.fixHardcodedSecret",
                        title: "Replace with env variable",
                        arguments: [document, diagnostic.range]
                    };
                    return fix;
                }

                if (diagnostic.message.includes("missing-authorization")) {
                    const fix = new vscode.CodeAction(
                        "Add @login_required decorator",
                        vscode.CodeActionKind.QuickFix
                    );
                    fix.command = {
                        command: "cognitiveTrust.fixMissingAuth",
                        title: "Add @login_required decorator",
                        arguments: [document, diagnostic.range]
                    };
                    return fix;
                }

                return null;
            }).filter((action): action is vscode.CodeAction => action !== null);
        }
    };

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('*', codeActionProvider)
    );

    // Quick Fix for hardcoded secret
    vscode.commands.registerCommand("cognitiveTrust.fixHardcodedSecret", async (document, range) => {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, range, "process.env.MY_SECRET"); // Node style
        await vscode.workspace.applyEdit(edit);

        const findings = await runSemgrep(document.fileName);
        if (findings.length === 0) {
            vscode.window.showInformationMessage("Fix confirmed. No remaining issues.");
        }
    });

    // Quick Fix for missing authorization
    vscode.commands.registerCommand("cognitiveTrust.fixMissingAuth", async (document, range) => {
        const edit = new vscode.WorkspaceEdit();
        const line = range.start.line;
        const position = new vscode.Position(line, 0);
        // Insert decorator above the route
        edit.insert(document.uri, position, "@login_required\n");
        await vscode.workspace.applyEdit(edit);

        vscode.window.showInformationMessage("Authorization decorator added.");
    });

    // Prompt enrichment: suggest improvements when developer types risky prompts
    vscode.workspace.onDidChangeTextDocument(event => {
        const content = event.contentChanges[0]?.text.toLowerCase();
        if (!content) {
            return;
        }

        const promptHints: { keyword: string, message: string }[] = [
            { keyword: "connect to database", message: "Ensure secure connection (TLS, no hardcoded credentials)." },
            { keyword: "login", message: "Always enforce authentication and role-based access control." },
            { keyword: "auth", message: "Include authorization checks, not just authentication." },
            { keyword: "api key", message: "Store API keys in environment variables, not in code." }
        ];

        for (const hint of promptHints) {
            if (content.includes(hint.keyword)) {
                vscode.window.showInformationMessage(`[Prompt Enrichment] ${hint.message}`);
            }
        }
    });
}

// Helper to run Semgrep and update diagnostics
async function scanDocument(document: vscode.TextDocument) {
    const findings = await runSemgrep(document.fileName);

    console.log("Semgrep findings:", findings);
    vscode.window.showInformationMessage(`Found ${findings.length} issues in ${document.fileName}`);

    const diagnostics: vscode.Diagnostic[] = findings.map(f => {
        const ruleId = f.check_id.split(".").pop();
        return new vscode.Diagnostic(
            new vscode.Range(
                new vscode.Position(f.start.line - 1, 0),
                new vscode.Position(f.start.line - 1, Number.MAX_SAFE_INTEGER)
            ),
            `[${ruleId}] ${f.extra.message}`,
            vscode.DiagnosticSeverity.Warning
        );
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate() {}