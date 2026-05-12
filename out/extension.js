"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const TaskViewProvider_1 = require("./TaskViewProvider");
function activate(context) {
    const provider = new TaskViewProvider_1.TaskViewProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TaskViewProvider_1.TaskViewProvider.viewType, provider));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map