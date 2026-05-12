import * as vscode from 'vscode';
import { TaskViewProvider } from './TaskViewProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TaskViewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(TaskViewProvider.viewType, provider)
    );
}

export function deactivate() { }
