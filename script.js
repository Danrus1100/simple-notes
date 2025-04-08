const themeToggle = document.getElementById('themeToggle');
const noteInput = document.getElementById('noteInput');
const noteTitle = document.getElementById('noteTitle');
const wordCount = document.getElementById('wordCount');
const saveNote = document.getElementById('saveNote');
const notesList = document.getElementById('notesList');
const newNoteBtn = document.getElementById('newNote');
const markdownPreview = document.getElementById('markdownPreview');

// Добавляем новые переменные
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const editorToggle = document.getElementById('editorToggle');
const previewToggle = document.getElementById('previewToggle');
const editorView = document.getElementById('editorView');
const previewView = document.getElementById('previewView');

const viewToggle = document.getElementById('viewToggle');
const statsToggle = document.getElementById('statsToggle');
const statsPanel = document.getElementById('statsPanel');

let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let currentNoteId = null;

// Обновление превью Markdown
function updatePreview() {
    markdownPreview.innerHTML = marked.parse(noteInput.value);
}

// Подсчёт статистики
function updateStats() {
    const text = noteInput.value;
    const trimmedText = text.trim();

    // Подсчёт слов
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    wordCount.textContent = words;

    // Подсчёт символов
    document.getElementById('charCount').textContent = text.length;

    // Подсчёт символов без пробелов
    document.getElementById('charNoSpaceCount').textContent = text.replace(/\s/g, '').length;

    // Подсчёт предложений
    const sentences = trimmedText ? trimmedText.split(/[.!?]+/).filter(Boolean).length : 0;
    document.getElementById('sentenceCount').textContent = sentences;

    // Подсчёт параграфов
    const paragraphs = trimmedText ? trimmedText.split(/\n\s*\n/).filter(Boolean).length : 0;
    document.getElementById('paragraphCount').textContent = paragraphs;
}

// Сохранение заметки
function saveNoteToList() {
    const title = noteTitle.value.trim() || 'Без названия';
    const text = noteInput.value.trim();
    
    if (!text) return;

    if (currentNoteId === null) {
        // Новая заметка
        const note = {
            id: Date.now(),
            title,
            text,
            created: new Date().toISOString()
        };
        notes.unshift(note);
        currentNoteId = note.id;
    } else {
        // Обновление существующей заметки
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = title;
            note.text = text;
        }
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotesList();
}

// Рендеринг списка заметок
function renderNotesList() {
    notesList.innerHTML = notes.map(note => `
        <div class="tab-item ${note.id === currentNoteId ? 'active' : ''}" 
             data-id="${note.id}">
            ${note.title}
        </div>
    `).join('');

    // Добавляем обработчики для вкладок
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => loadNote(parseInt(tab.dataset.id)));
    });
}

// Загрузка заметки
function loadNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        currentNoteId = id;
        noteTitle.value = note.title;
        noteInput.value = note.text;
        updateStats();
        updatePreview();
        renderNotesList();
    }
}

// Создание новой заметки
function createNewNote() {
    currentNoteId = null;
    noteTitle.value = '';
    noteInput.value = '';
    updateStats();
    updatePreview();
    renderNotesList();
}

// Функция переключения сайдбара
function toggleSidebar() {
    sidebar.classList.toggle('visible');
}

// Заменяем существующие функции toggleView
function toggleView() {
    const isPreview = viewToggle.checked;
    if (!isPreview) {
        editorView.classList.remove('hidden');
        previewView.classList.add('hidden');
    } else {
        editorView.classList.add('hidden');
        previewView.classList.remove('hidden');
        updatePreview();
    }
}

function toggleStats() {
    statsPanel.classList.toggle('hidden');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    if (notes.length > 0) {
        loadNote(notes[0].id);
    }
    
    renderNotesList();

    // Закрываем сайдбар при клике на заметку на мобильных устройствах
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('visible');
    }
});

// Обработчики событий
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

noteInput.addEventListener('input', () => {
    updateStats();
    updatePreview();
});

saveNote.addEventListener('click', saveNoteToList);
newNoteBtn.addEventListener('click', createNewNote);

sidebarToggle.addEventListener('click', toggleSidebar);
viewToggle.addEventListener('change', toggleView);
statsToggle.addEventListener('click', toggleStats);

// Закрываем сайдбар при клике на заметку на мобильных устройствах
notesList.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && e.target.classList.contains('tab-item')) {
        sidebar.classList.remove('visible');
    }
});

// Добавляем закрытие статистики при клике вне панели
document.addEventListener('click', (e) => {
    if (!statsPanel.contains(e.target) && e.target !== statsToggle) {
        statsPanel.classList.add('hidden');
    }
});
