let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskInput = document.getElementById('taskInput');
const taskDescription = document.getElementById('taskDescription');
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
const editTaskDescription = document.getElementById('editTaskDescription');
const editDeadlineInput = document.getElementById('editDeadlineInput');
const editSubTaskList = document.getElementById('editSubTaskList');
const newSubTaskInput = document.getElementById('newSubTaskInput');
const addSubTaskBtn = document.getElementById('addSubTask');
const saveEditTaskBtn = document.getElementById('saveEditTask');
const cancelEditTaskBtn = document.getElementById('cancelEditTask');
const taskDetailsModal = document.getElementById('taskDetailsModal');
const taskDetailsTitle = document.getElementById('taskDetailsTitle');
const taskDetailsDescription = document.getElementById('taskDetailsDescription');
const taskDetailsDeadline = document.getElementById('taskDetailsDeadline');
const taskDetailsSubTasks = document.getElementById('taskDetailsSubTasks');
const closeTaskDetailsBtn = document.getElementById('closeTaskDetails');

let currentFilter = 'all';
let currentEditingTaskId = null;

function addTask() {
    const taskText = taskInput.value.trim();
    const description = taskDescription.value.trim();
    const deadline = deadlineInput.value;
    if (taskText && deadline) {
        const task = {
            id: Date.now(),
            text: taskText,
            description: description,
            deadline: deadline,
            completed: false,
            createdAt: new Date().toISOString(),
            pinned: false,
            subTasks: []
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskDescription.value = '';
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
        editTaskDescription.value = task.description;
        editDeadlineInput.value = task.deadline;
        renderEditSubTasks(task.subTasks);
        editTaskModal.style.display = 'block';
    }
}

function closeEditModal() {
    editTaskModal.style.display = 'none';
    currentEditingTaskId = null;
}

function renderEditSubTasks(subTasks) {
    editSubTaskList.innerHTML = '';
    subTasks.forEach((subTask, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between mb-2';
        li.innerHTML = `
            <span>${subTask}</span>
            <button class="text-red-500" onclick="deleteSubTask(${index})"><i class="fas fa-trash"></i></button>
        `;
        editSubTaskList.appendChild(li);
    });
}

function deleteSubTask(index) {
    const task = tasks.find(task => task.id === currentEditingTaskId);
    if (task) {
        task.subTasks.splice(index, 1);
        renderEditSubTasks(task.subTasks);
    }
}

function addSubTask() {
    const subTaskText = newSubTaskInput.value.trim();
    if (subTaskText) {
        const task = tasks.find(task => task.id === currentEditingTaskId);
        if (task) {
            task.subTasks.push(subTaskText);
            renderEditSubTasks(task.subTasks);
            newSubTaskInput.value = '';
        }
    }
}

function saveEditTask() {
    const task = tasks.find(task => task.id === currentEditingTaskId);
    if (task) {
        task.text = editTaskInput.value.trim();
        task.description = editTaskDescription.value.trim();
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
            task.text.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.subTasks.some(subTask => subTask.toLowerCase().includes(searchTerm))
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
        taskInfo.className = 'flex-1 cursor-pointer';
        taskInfo.onclick = () => showTaskDetails(task.id);
        
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
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            toggleTaskStatus(task.id);
        };
        
        const editBtn = document.createElement('button');
        editBtn.className = 'px-2 py-1 rounded bg-blue-500 text-white';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openEditModal(task.id);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'px-2 py-1 rounded bg-red-500 text-white';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        };

        const pinBtn = document.createElement('button');
        pinBtn.className = `px-2 py-1 rounded ${task.pinned ? 'bg-indigo-500' : 'bg-gray-500'} text-white`;
        pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
        pinBtn.onclick = (e) => {
            e.stopPropagation();
            togglePinTask(task.id);
        };
        
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

function showTaskDetails(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        taskDetailsTitle.textContent = task.text;
        taskDetailsDescription.textContent = task.description || 'No description available.';
        taskDetailsDeadline.textContent = `Deadline: ${new Date(task.deadline).toLocaleString()}`;
        
        taskDetailsSubTasks.innerHTML = '';
        if (task.subTasks.length > 0) {
            task.subTasks.forEach(subTask => {
                const li = document.createElement('li');
                li.textContent = subTask;
                taskDetailsSubTasks.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No sub-tasks available.';
            taskDetailsSubTasks.appendChild(li);
        }
        
        taskDetailsModal.style.display = 'block';
    }
}

function closeTaskDetails() {
    taskDetailsModal.style.display = 'none';
}

function updateCountdown(task, element) {
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
    }
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
addSubTaskBtn.addEventListener('click', addSubTask);
closeTaskDetailsBtn.addEventListener('click', closeTaskDetails);

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

renderTasks();
    