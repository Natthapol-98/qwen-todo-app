// Task manager class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.loadTasks();
        this.setupEventListeners();
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Load tasks from localStorage
    loadTasks() {
        this.renderTasks();
        this.updateTaskCount();
    }

    // Add a new task
    addTask(text) {
        if (text.trim() === '') return;
        
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    // Delete a task
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    // Toggle task completion status
    toggleTask(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    // Clear completed tasks
    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    // Filter tasks based on current filter
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Update task count display
    updateTaskCount() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        document.getElementById('task-count').textContent = 
            `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }

    // Render tasks to the DOM
    renderTasks() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <p>${this.currentFilter === 'completed' ? 'No completed tasks' : 
                       this.currentFilter === 'active' ? 'No active tasks' : 
                       'No tasks yet. Add a new task to get started!'}</p>
                </div>
            `;
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn">✕</button>
            </li>
        `).join('');
    }

    // Set up event listeners
    setupEventListeners() {
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            const input = document.getElementById('task-input');
            this.addTask(input.value);
            input.value = '';
            input.focus();
        });

        // Add task on Enter key
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('task-input');
                this.addTask(input.value);
                input.value = '';
            }
        });

        // Task list event delegation
        document.getElementById('task-list').addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = Number(taskItem.dataset.id);
            
            if (e.target.classList.contains('delete-btn')) {
                this.deleteTask(taskId);
            } else if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(taskId);
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                this.currentFilter = button.dataset.filter;
                this.renderTasks();
            });
        });

        // Clear completed button
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });
    }
}

// Timer class
class Timer {
    constructor() {
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.interval = null;
        this.isRunning = false;
        this.setupEventListeners();
    }

    // Format time values to always have two digits
    formatTime(value) {
        return value < 10 ? `0${value}` : value;
    }

    // Update the timer display
    updateDisplay() {
        const display = document.getElementById('timer');
        display.textContent = `${this.formatTime(this.hours)}:${this.formatTime(this.minutes)}:${this.formatTime(this.seconds)}`;
    }

    // Start the timer
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.seconds++;
            if (this.seconds >= 60) {
                this.seconds = 0;
                this.minutes++;
                if (this.minutes >= 60) {
                    this.minutes = 0;
                    this.hours++;
                }
            }
            this.updateDisplay();
        }, 1000);
    }

    // Pause the timer
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
    }

    // Reset the timer
    reset() {
        this.pause();
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.updateDisplay();
    }

    // Set up event listeners for timer controls
    setupEventListeners() {
        document.getElementById('start-timer').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('pause-timer').addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('reset-timer').addEventListener('click', () => {
            this.reset();
        });
    }
}

// Calendar class
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.renderCalendar();
        this.setupEventListeners();
    }

    // Get the number of days in a month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // Format the month and year for display
    formatMonthYear(date) {
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString('th-TH', options);
    }

    // Render the calendar
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update the month/year display
        document.getElementById('current-month-year').textContent = this.formatMonthYear(this.currentDate);
        
        // Get calendar data
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfMonth = this.getFirstDayOfMonth(year, month);
        
        // Get today's date for comparison
        const today = new Date();
        const isCurrentMonth = 
            today.getFullYear() === year && 
            today.getMonth() === month;
        
        // Generate calendar HTML
        let calendarHTML = '';
        
        // Add day headers (Su, Mo, Tu, We, Th, Fr, Sa)
        const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
        days.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === today.getDate();
            const isSelected = 
                this.selectedDate.getFullYear() === year &&
                this.selectedDate.getMonth() === month &&
                this.selectedDate.getDate() === day;
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     data-day="${day}">
                    ${day}
                </div>
            `;
        }
        
        // Update the calendar in the DOM
        document.getElementById('calendar').innerHTML = calendarHTML;
        
        // Update the selected date display
        this.updateSelectedDateDisplay();
    }

    // Update the selected date display
    updateSelectedDateDisplay() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = this.selectedDate.toLocaleDateString('th-TH', options);
        document.getElementById('selected-date-display').textContent = dateString;
    }

    // Set up event listeners
    setupEventListeners() {
        // Previous month button
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        // Next month button
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Calendar day selection
        document.getElementById('calendar').addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day:not(.empty)');
            if (!dayElement) return;
            
            const day = parseInt(dayElement.dataset.day);
            this.selectedDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            );
            
            this.renderCalendar();
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
    new Timer();
    new Calendar();
});