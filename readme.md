![任务演示](https://github.com/paulhoo500/task-planner/blob/main/demo.gif)

Task Flow Planner
A minimalist, project-embedded task management solution for developers. Built for speed, precision, and version control.

1. Vision
Task Flow Planner brings task management directly into your workspace. By generating a JSON file bound to your project, it keeps your planning and development in perfect sync. Your task history becomes part of your code's evolution.

2. Core Features
A. Minimalist Task View (Side Bar)

Clean List: A clutter-free sidebar view to track your current project tasks.

Quick Add: A persistent "New Task" button at the bottom for capturing ideas instantly.

Status Management: Simple checkboxes for effortless state tracking.

B. Auto-Timestamping Logic

Metadata Tracking: Automatic generation of creation and last-modified timestamps for every task.

Completion Insight: Completed tasks capture the exact timestamp of achievement (YYYY-MM-DD HH:mm).

C. Seamless Interaction

In-Place Editing: Every task can be edited directly within the list.

Local Persistence: Automatically creates/updates a [ProjectName].json file in your workspace root.

D. Latest Updates (2026.05.01)

File Association: Automatic linkage—click to open relevant files directly.

Visual Status: Completed tasks are highlighted in green for quick scanning.

Focus Mode: New task input fields are now centered to minimize distractions and maximize input efficiency.

3. Data Schema (JSON)
The data is stored in a structured JSON format, making it fully Git-compatible and easy to modify manually:

-------------I!---------AM!----------SEPARATOR~~~~~~~-------------------

1. 项目愿景

本插件旨在为开发者提供一种“项目内嵌式”的任务追踪方案。通过在项目根目录生成一个
与项目名绑定的 JSON 文件,实现任务计划与代码库的同步管理,让代码逻辑的演进历程清
晰可见。

2. 核心功能设计

A. 极简任务看板 (Side Bar View)
列表视图: 以简洁的列表形式展示当前项目的所有任务计划。
新建功能: 底部常驻“新建”按钮,点击弹出输入框,快速记录灵感或任务。
状态流转: 每条任务左侧配有 Checkbox(勾选框)。

B. 时间戳逻辑 (Auto-Timestamp)
创建/修改时间: 任务新建或编辑后,右上角自动显示最后一次操作的时间。
完成时间: 任务被勾选完成后,右上角状态更新为“完成于:YYYY-MM-DD
HH:mm”。

C. 交互与编辑
点击编辑: 列表中的每一条任务均可点击进入编辑模式。
持久化存储: 自动在当前工作区根目录创建 [项目文件夹名].json 。
·
·
·

·
·

·
·

3. 数据存储结构 (Schema)

数据将以结构化的 JSON 格式存储,便于 Git 版本管理和手动微调:

{
"projectName": "MyProject",
"tasks": [
{
"id": "uuid-12345",
"content": "实现代码逻辑重构",
"status": "completed",
"createTime": "2024-05-12 10:00:00",
"updateTime": "2024-05-12 11:30:00",
"completeTime": "2024-05-12 11:30:00"
}
]
}

4. 界面原型草图

+-----------------------------------+
| TASK FLOW PLANNER [X] |
+-----------------------------------+
| [ ] 任务 1 (11:00 修改) |
| [x] 任务 2 (11:30 完成) |
| > 点击此处编辑这条任务内容... |
+-----------------------------------+
| [ + 新建任务 ] |
+-----------------------------------+
2026.5.1更新
5. 自动关联文件名,点击打开
6. 完成的任务,绿色显示
7. 新建的时候,居中显示,方便编辑