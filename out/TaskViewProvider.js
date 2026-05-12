"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskViewProvider = void 0;
const vscode = require("vscode");
class TaskViewProvider {
    constructor(extensionUri, context) {
        this._extensionUri = extensionUri;
        this._context = context;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'save':
                    await this.saveTasksToFile(data.data);
                    break;
                case 'ready':
                    const savedData = await this.loadTasksFromFile();
                    webviewView.webview.postMessage({ type: 'load', data: savedData });
                    break;
            }
        });
    }
    getTaskFileUri() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return vscode.Uri.joinPath(workspaceFolders[0].uri, '.tasklist.json');
        }
        return undefined;
    }
    async loadTasksFromFile() {
        const uri = this.getTaskFileUri();
        if (!uri) {
            // 如果没有打开文件夹，则降级使用 workspaceState
            return this._context.workspaceState.get('tasklist.tasks', '[]');
        }
        try {
            const data = await vscode.workspace.fs.readFile(uri);
            return new TextDecoder().decode(data);
        }
        catch (error) {
            // 文件不存在或读取失败时返回空数组
            return '[]';
        }
    }
    async saveTasksToFile(data) {
        const uri = this.getTaskFileUri();
        if (!uri) {
            // 如果没有打开文件夹，则降级使用 workspaceState
            this._context.workspaceState.update('tasklist.tasks', data);
            return;
        }
        try {
            const buffer = new TextEncoder().encode(data);
            await vscode.workspace.fs.writeFile(uri, buffer);
        }
        catch (error) {
            vscode.window.showErrorMessage('保存任务列表失败: ' + error);
        }
    }
    _getHtmlForWebview() {
        // 读取插件配置中的字体大小
        const config = vscode.workspace.getConfiguration('taskplanner');
        const fontSize = config.get('fontSize', '14px');
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Task List</title>
                <style>
                    body { font-family: var(--vscode-font-family); font-size: ${fontSize}; padding: 10px; color: var(--vscode-foreground); }
                    .task-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                    /* 未完成的任务底色: 半透明灰色，左侧加上焦点色的粗边框强调 */
                    .task-item { background: rgba(130, 130, 130, 0.08); border: 1px solid var(--vscode-widget-border); border-left: 4px solid var(--vscode-focusBorder); padding: 8px; border-radius: 4px; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 4px; transition: all 0.2s ease; }
                    .task-item:hover { background: rgba(130, 130, 130, 0.15); }
                    /* 已完成的任务底色: 柔和的半透明绿色，左侧变成绿色粗边框，整体稍透明 */
                    .task-item.completed { opacity: 0.8; background: rgba(76, 175, 80, 0.1); border-color: rgba(76, 175, 80, 0.2); border-left: 4px solid #4CAF50; }
                    .task-item.completed .task-text { text-decoration: line-through; cursor: default; }
                    .task-content { display: flex; gap: 8px; flex: 1; min-width: 0; align-items: flex-start; width: 100%; }
                    .task-time-header { font-size: 0.8em; color: var(--vscode-descriptionForeground); text-align: right; width: 100%; }
                    .task-text { flex: 1; cursor: pointer; padding: 4px 6px; border: 1px solid transparent; word-wrap: break-word; white-space: pre-wrap; }
                    .task-text:hover { border: 1px dashed var(--vscode-focusBorder); background: rgba(130,130,130,0.1); }
                    .task-checkbox { cursor: pointer; flex-shrink: 0; margin-top: 6px; }
                    .new-task-container { display: flex; flex-direction: column; gap: 8px; }
                    input[type="text"] { font-family: inherit; font-size: inherit; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 6px; border-radius: 2px; flex: 1; }
                    button { font-family: inherit; font-size: inherit; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 10px; cursor: pointer; border-radius: 2px; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                    .edit-container { display: flex; flex: 1; gap: 4px; }
                </style>
            </head>
            <body>
                <div class="task-list" id="taskList"></div>
                <div class="new-task-container">
                    <input type="text" id="newTaskInput" placeholder="输入记录或计划" style="display:none;" />
                    <button id="addBtn">新建 / 确认</button>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    let tasks = [];
                    const taskListEl = document.getElementById('taskList');
                    const inputEl = document.getElementById('newTaskInput');
                    const addBtn = document.getElementById('addBtn');
                    
                    let isTyping = false;

                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.type === 'load') {
                            try {
                                tasks = JSON.parse(message.data) || [];
                            } catch(e) { tasks = []; }
                            renderTasks();
                        }
                    });

                    // 告诉插件网页已经加载完毕
                    vscode.postMessage({ type: 'ready' });

                    function saveTasks() {
                        vscode.postMessage({ type: 'save', data: JSON.stringify(tasks) });
                    }

                    function renderTasks() {
                        taskListEl.innerHTML = '';
                        tasks.forEach(task => {
                            const item = document.createElement('div');
                            item.className = 'task-item' + (task.completed ? ' completed' : '');

                            // 顶部时间栏
                            let timeText = '';
                            if (task.completed && task.completedTime) {
                                timeText = '完: ' + task.completedTime;
                            } else if (task.editTime) {
                                timeText = '改: ' + task.editTime;
                            }
                            
                            if (timeText) {
                                const timeHeader = document.createElement('div');
                                timeHeader.className = 'task-time-header';
                                timeHeader.textContent = timeText;
                                item.appendChild(timeHeader);
                            }
                            
                            // 主体内容区（Checkbox + Text/Input）
                            const content = document.createElement('div');
                            content.className = 'task-content';
                            
                            const cb = document.createElement('input');
                            cb.type = 'checkbox';
                            cb.className = 'task-checkbox';
                            cb.checked = task.completed;
                            cb.onclick = () => completeTask(task.id, cb.checked);
                            
                            content.appendChild(cb);

                            if (task.isEditing) {
                                const editContainer = document.createElement('div');
                                editContainer.className = 'edit-container';
                                
                                const editInput = document.createElement('input');
                                editInput.type = 'text';
                                editInput.value = task.text;
                                
                                const saveBtn = document.createElement('button');
                                saveBtn.textContent = '保存';
                                saveBtn.onclick = () => saveEdit(task.id, editInput.value);

                                const cancelBtn = document.createElement('button');
                                cancelBtn.textContent = '取消';
                                cancelBtn.onclick = () => cancelEdit(task.id);

                                editContainer.appendChild(editInput);
                                editContainer.appendChild(saveBtn);
                                editContainer.appendChild(cancelBtn);
                                content.appendChild(editContainer);
                            } else {
                                const text = document.createElement('div');
                                text.className = 'task-text';
                                text.textContent = task.text;
                                text.title = "点击重新编辑";
                                if (!task.completed) {
                                    // 未完成时可点击编辑
                                    text.onclick = () => startEdit(task.id);
                                }
                                content.appendChild(text);
                            }

                            item.appendChild(content);
                            taskListEl.appendChild(item);
                        });
                    }

                    function completeTask(id, checked) {
                        const task = tasks.find(t => t.id === id);
                        if(task) {
                            task.completed = checked;
                            task.completedTime = checked ? new Date().toLocaleString() : null;
                            task.isEditing = false; 
                            renderTasks();
                            saveTasks();
                        }
                    }

                    function startEdit(id) {
                        const task = tasks.find(t => t.id === id);
                        if (task && !task.completed) {
                            task.isEditing = true;
                            renderTasks();
                        }
                    }

                    function saveEdit(id, newText) {
                        const task = tasks.find(t => t.id === id);
                        if (task && newText.trim() !== '') {
                            task.text = newText.trim();
                            task.editTime = new Date().toLocaleString();
                            task.isEditing = false;
                            renderTasks();
                            saveTasks();
                        } else {
                            cancelEdit(id);
                        }
                    }

                    function cancelEdit(id) {
                        const task = tasks.find(t => t.id === id);
                        if (task) {
                            task.isEditing = false;
                            renderTasks();
                        }
                    }

                    addBtn.onclick = () => {
                        if (!isTyping) {
                            inputEl.style.display = 'block';
                            inputEl.focus();
                            isTyping = true;
                            addBtn.textContent = '确认';
                        } else {
                            const val = inputEl.value.trim();
                            if (val) {
                                tasks.push({
                                    id: Date.now(),
                                    text: val,
                                    completed: false,
                                    createTime: new Date().toLocaleString(),
                                    editTime: null,
                                    isEditing: false
                                });
                                renderTasks();
                                saveTasks();
                            }
                            inputEl.value = '';
                            inputEl.style.display = 'none';
                            isTyping = false;
                            addBtn.textContent = '新建';
                        }
                    };
                </script>
            </body>
            </html>`;
    }
}
exports.TaskViewProvider = TaskViewProvider;
TaskViewProvider.viewType = 'taskplanner.taskView';
//# sourceMappingURL=TaskViewProvider.js.map