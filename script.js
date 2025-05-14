
        // Initialize tasks and state
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let editingIndex = null;
        const today = new Date().toISOString().split('T')[0];

        // Show notification
        function showNotification(message, isError = false) {
            const notification = document.getElementById('notification');
            const messageEl = document.getElementById('notificationMessage');
            notification.className = `notification ${isError ? 'error' : 'success'} show`;
            messageEl.textContent = message || 'Action completed.';
            setTimeout(() => {
                notification.className = `notification ${isError ? 'error' : 'success'}`;
            }, 3000);
        }

        // Render tasks
        function renderTasks() {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            if (!tasks || tasks.length === 0) {
                taskList.innerHTML = '<li style="text-align: center; color: #6b7280;">No tasks available.</li>';
                return;
            }
            tasks.forEach((task, index) => {
                if (!task || !task.text) return;
                const li = document.createElement('li');
                li.className = `priority-${task.priority?.toLowerCase() || 'low'} ${task.completed ? 'completed' : ''}`;
                const isOverdue = task.dueDate && task.dueDate < today && !task.completed;
                if (editingIndex === index) {
                    li.innerHTML = `
                        <div class="edit-form">
                            <input 
                                id="editText${index}" 
                                type="text" 
                                value="${task.text}"
                            >
                            <select id="editCategory${index}">
                                <option value="Work" ${task.category === 'Work' ? 'selected' : ''}>Work</option>
                                <option value="Personal" ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
                                <option value="Urgent" ${task.category === 'Urgent' ? 'selected' : ''}>Urgent</option>
                            </select>
                            <input 
                                id="editDueDate${index}" 
                                type="date" 
                                value="${task.dueDate || ''}"
                                min="${today}"
                            >
                            <select id="editPriority${index}">
                                <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                                <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                            </select>
                            <button class="save-btn tooltip" data-tooltip="Save changes" onclick="saveEdit(${index})"></button>
                            <button class="cancel-btn tooltip" data-tooltip="Cancel editing" onclick="cancelEdit()"></button>
                        </div>
                    `;
                } else {
                    li.innerHTML = `
                        <div class="task-header">
                            <div class="task-info">
                                <input 
                                    type="checkbox" 
                                    ${task.completed ? 'checked' : ''} 
                                    onchange="toggleTask(${index})"
                                >
                                <div class="details">
                                    <span>${task.text}</span>
                                </div>
                            </div>
                            <div class="actions">
                                <button class="edit-btn tooltip" data-tooltip="Edit task" onclick="editTask(${index})"></button>
                                <button class="delete-btn tooltip" data-tooltip="Delete task" onclick="deleteTask(${index})"></button>
                            </div>
                        </div>
                        <div class="task-details">
                            <p>Category: ${task.category || 'Uncategorized'}</p>
                            <p>Due: ${task.dueDate || 'None'} ${isOverdue ? '<span class="badge overdue">Overdue</span>' : ''}</p>
                            <p>Priority: <span class="badge priority-${task.priority?.toLowerCase() || 'low'}">${task.priority || 'None'}</span></p>
                        </div>
                    `;
                    li.onclick = (e) => {
                        if (!e.target.closest('button, input')) {
                            li.classList.toggle('expanded');
                        }
                    };
                }
                taskList.appendChild(li);
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Add task
        function addTask() {
            const text = document.getElementById('taskText').value.trim();
            const category = document.getElementById('taskCategory').value;
            const dueDate = document.getElementById('taskDueDate').value;
            const priority = document.getElementById('taskPriority').value;
            if (!text) {
                showNotification('Task description is required.', true);
                return;
            }
            if (dueDate && dueDate < today) {
                showNotification('Due date cannot be in the past.', true);
                return;
            }
            tasks.push({ text, category, dueDate, priority, completed: false });
            document.getElementById('taskText').value = '';
            document.getElementById('taskDueDate').value = '';
            showNotification('Task added successfully.');
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }

        // Toggle task completion
        function toggleTask(index) {
            if (!tasks[index]) {
                showNotification('Invalid task.', true);
                return;
            }
            tasks[index].completed = !tasks[index].completed;
            showNotification(`Task "${tasks[index].text}" marked as ${
                tasks[index].completed ? 'completed' : 'pending'
            }.`);
            renderTasks();
        }

        // Edit task
        function editTask(index) {
            if (!tasks[index]) {
                showNotification('Invalid task.', true);
                return;
            }
            editingIndex = index;
            renderTasks();
        }

        // Save edited task
        function saveEdit(index) {
            if (!tasks[index]) {
                showNotification('Invalid task.', true);
                return;
            }
            const text = document.getElementById(`editText${index}`).value.trim();
            const category = document.getElementById(`editCategory${index}`).value;
            const dueDate = document.getElementById(`editDueDate${index}`).value;
            const priority = document.getElementById(`editPriority${index}`).value;
            if (!text) {
                showNotification('Task description is required.', true);
                return;
            }
            if (dueDate && dueDate < today) {
                showNotification('Due date cannot be in the past.', true);
                return;
            }
            tasks[index] = { ...tasks[index], text, category, dueDate, priority };
            editingIndex = null;
            showNotification('Task updated successfully.');
            renderTasks();
        }

        // Cancel edit
        function cancelEdit() {
            editingIndex = null;
            renderTasks();
        }

        // Delete task
        function deleteTask(index) {
            if (!tasks[index]) {
                showNotification('Invalid task.', true);
                return;
            }
            const taskName = tasks[index].text || 'Task';
            tasks.splice(index, 1);
            showNotification(`Task "${taskName}" deleted.`);
            renderTasks();
        }

        // Clear all tasks
        function clearAllTasks() {
            if (tasks.length === 0) {
                showNotification('No tasks to clear.', true);
                return;
            }
            if (confirm('Are you sure you want to clear all tasks?')) {
                tasks = [];
                localStorage.setItem('tasks', JSON.stringify(tasks));
                showNotification('All tasks cleared.');
                renderTasks();
            }
        }

        // Export tasks
        function exportTasks() {
            if (tasks.length === 0) {
                showNotification('No tasks to export.', true);
                return;
            }
            const dataStr = JSON.stringify(tasks, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'tasks.json';
            link.click();
            URL.revokeObjectURL(url);
            showNotification('Tasks exported successfully.');
        }

        // Import tasks
        function importTasks(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedTasks = JSON.parse(e.target.result);
                    if (!Array.isArray(importedTasks)) {
                        showNotification('Invalid file format.', true);
                        return;
                    }
                    tasks = importedTasks.filter(task => task && task.text);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    showNotification('Tasks imported successfully.');
                    renderTasks();
                } catch (err) {
                    showNotification('Error importing tasks.', true);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        // List tasks
        function listTasks() {
            if (!tasks || tasks.length === 0) {
                showNotification('No tasks to display.', true);
            } else {
                showNotification('Tasks loaded successfully.');
            }
            renderTasks();
        }

        // Console command for listing tasks
        window.list = function() {
            console.log('Tasks:', tasks.filter(task => task && task.text));
            listTasks();
        };

        // Set theme
        function setTheme(theme) {
            document.body.classList.remove('dark', 'high-contrast');
            if (theme !== 'light') {
                document.body.classList.add(theme);
            }
            localStorage.setItem('theme', theme);
            document.querySelector('.theme-toggle').value = theme;
        }

        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        // Initial render
        renderTasks();

        // Add task on Enter key
        document.getElementById('taskText').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cancelEdit();
            }
        });