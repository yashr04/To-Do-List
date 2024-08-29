let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskInput = document.getElementById('taskInput');
const deadlineInput = document.getElementById('deadlineInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const showAllBtn = document.getElementById('showAll');
const showPendingBtn = document.getElementById('showPending');
const showCompletedBtn = document.getElementById('showCompleted');
const showIncompleteBtn = document.getElementById('showIncomplete');
const searchInput = document.getElementById('searchInput');
const editTaskModal = document.getElementById('editTaskModal');
const editTaskInput = document.getElementById('editTaskInput');
const editDeadlineInput = document.getElementById('editDeadlineInput');
const saveEditTaskBtn = document.getElementById('saveEditTask');
const cancelEditTaskBtn = document.getElementById('cancelEditTask');

let currentFilter = 'all';
let currentEditingTaskId = null;

function addTask() {
    const taskText = taskInput.value.trim();
    const deadline = deadlineInput.value;
    if (taskText && deadline) {
        const task = {
            id: Date.now(),
            text: taskText,
            deadline: deadline,
            completed: false,
            createdAt: new Date().toISOString(),
            pinned: false
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        deadlineInput.value = '';
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function toggleTaskStatus(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function openEditModal(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        currentEditingTaskId = id;
        editTaskInput.value = task.text;
        editDeadlineInput.value = task.deadline;
        editTaskModal.style.display = 'block';
    }
}

function closeEditModal() {
    editTaskModal.style.display = 'none';
    currentEditingTaskId = null;
}

function saveEditTask() {
    const task = tasks.find(task => task.id === currentEditingTaskId);
    if (task) {
        task.text = editTaskInput.value.trim();
        task.deadline = editDeadlineInput.value;
        saveTasks();
        renderTasks();
        closeEditModal();
    }
}

function togglePinTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.pinned = !task.pinned;
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredTasks = tasks;
    
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed && new Date(task.deadline) > new Date());
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'incomplete') {
        filteredTasks = tasks.filter(task => !task.completed && new Date(task.deadline) <= new Date());
    }

    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }

    filteredTasks.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-3 ${task.completed ? 'bg-green-100' : new Date(task.deadline) <= new Date() ? 'bg-red-100' : 'bg-yellow-100'} rounded mb-2 ${task.pinned ? 'pinned-task' : ''}`;
        
        const taskInfo = document.createElement('div');
        taskInfo.className = 'flex-1';
        
        const taskText = document.createElement('p');
        taskText.className = `${task.completed ? 'line-through' : ''} font-semibold`;
        taskText.textContent = task.text;
        
        const deadlineText = document.createElement('p');
        deadlineText.className = 'text-sm text-gray-600';
        deadlineText.textContent = `Deadline: ${new Date(task.deadline).toLocaleString()}`;
        
        const countdownText = document.createElement('p');
        countdownText.className = 'text-sm text-gray-600';
        
        taskInfo.appendChild(taskText);
        taskInfo.appendChild(deadlineText);
        taskInfo.appendChild(countdownText);
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex space-x-2';
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = `px-2 py-1 rounded ${task.completed ? 'bg-yellow-500' : 'bg-green-500'} text-white`;
        toggleBtn.innerHTML = `<i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>`;
        toggleBtn.onclick = () => toggleTaskStatus(task.id);
        
        const editBtn = document.createElement('button');
        editBtn.className = 'px-2 py-1 rounded bg-blue-500 text-white';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => openEditModal(task.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'px-2 py-1 rounded bg-red-500 text-white';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => deleteTask(task.id);

        const pinBtn = document.createElement('button');
        pinBtn.className = `px-2 py-1 rounded ${task.pinned ? 'bg-indigo-500' : 'bg-gray-500'} text-white`;
        pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
        pinBtn.onclick = () => togglePinTask(task.id);
        
        buttonsContainer.appendChild(toggleBtn);
        buttonsContainer.appendChild(editBtn);
        buttonsContainer.appendChild(deleteBtn);
        buttonsContainer.appendChild(pinBtn);
        
        li.appendChild(taskInfo);
        li.appendChild(buttonsContainer);
        
        taskList.appendChild(li);
        
        updateCountdown(task, countdownText);
    });
}

function updateCountdown(task, element) {
    let timer;

    const updateTimer = () => {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const timeDiff = deadline - now;

        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            element.textContent = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            element.textContent = 'Deadline passed';
            clearInterval(timer);
        }
    };

    updateTimer();
    timer = setInterval(updateTimer, 1000);
}

addTaskBtn.addEventListener('click', addTask);
showAllBtn.addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
});
showPendingBtn.addEventListener('click', () => {
    currentFilter = 'pending';
    renderTasks();
});
showCompletedBtn.addEventListener('click', () => {
    currentFilter = 'completed';
    renderTasks();
});
showIncompleteBtn.addEventListener('click', () => {
    currentFilter = 'incomplete';
    renderTasks();
});

searchInput.addEventListener('input', renderTasks);

saveEditTaskBtn.addEventListener('click', saveEditTask);
cancelEditTaskBtn.addEventListener('click', closeEditModal);

renderTasks();