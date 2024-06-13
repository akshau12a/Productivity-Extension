document.addEventListener('DOMContentLoaded', () => {
  const todoList = document.getElementById('todoList');
  const newTodo = document.getElementById('newTodo');
  const addButton = document.getElementById('addButton');

  const renderTodoList = () => {
    chrome.storage.local.get(['todos'], (result) => {
      const todos = result.todos || [];
      todoList.innerHTML = '';
      todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        if (todo.completed) {
          todoItem.classList.add('completed');
        }
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodoCompletion(index));
        const span = document.createElement('span');
        span.textContent = todo.text;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.addEventListener('click', () => removeTodoItem(index));
        todoItem.appendChild(checkbox);
        todoItem.appendChild(span);
        todoItem.appendChild(removeButton);
        todoList.appendChild(todoItem);
      });
    });
  };

  const addTodoItem = () => {
    const text = newTodo.value;
    if (text) {
      chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        todos.push({ text, completed: false });
        chrome.storage.local.set({ todos }, () => {
          newTodo.value = '';
          renderTodoList();
        });
      });
    }
  };

  const toggleTodoCompletion = (index) => {
    chrome.storage.local.get(['todos'], (result) => {
      const todos = result.todos || [];
      todos[index].completed = !todos[index].completed;
      chrome.storage.local.set({ todos }, () => {
        renderTodoList();
        if (todos[index].completed) {
          setTimeout(() => {
            removeTodoItem(index);
          }, 2000);
        }
      });
    });
  };

  const removeTodoItem = (index) => {
    chrome.storage.local.get(['todos'], (result) => {
      const todos = result.todos || [];
      todos.splice(index, 1);
      chrome.storage.local.set({ todos }, () => {
        renderTodoList();
      });
    });
  };

  addButton.addEventListener('click', addTodoItem);
  newTodo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodoItem();
    }
  });

  renderTodoList();
});


document.getElementById('startRecording').addEventListener('click', () => {
  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], (streamId) => {
    if (streamId) {
      navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: streamId
          }
        }
      }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        let chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = (e) => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'screen-recording.webm';
          a.click();
          URL.revokeObjectURL(url);
        };
        recorder.start();
        setTimeout(() => recorder.stop(), 10000); // Stops recording after 10 seconds for demo purposes
      });
    }
  });
});

document.getElementById('takeScreenshot').addEventListener('click', () => {
  chrome.tabs.captureVisibleTab((screenshotUrl) => {
    const a = document.createElement('a');
    a.href = screenshotUrl;
    a.download = 'screenshot.png';
    a.click();
  });
});
