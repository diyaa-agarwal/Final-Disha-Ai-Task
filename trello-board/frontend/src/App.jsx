import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './components/column';

function App() {
  const [columns, setColumns] = useState({});
  const [columnsMeta, setColumnsMeta] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const API_BASE = 'http://localhost:8000/api';

  useEffect(() => {
    fetch(`${API_BASE}/columns`)
      .then(res => res.json())
      .then(data => {
        const cols = {};
        const meta = {};
        data.columns.forEach(col => {
          meta[col.columnId] = { title: col.title, color: col.color };
          cols[col.columnId] = data.tasks[col.columnId].map(task => ({
            ...task,
            color: col.color || '#ccc',
          }));
        });
        setColumns(cols);
        setColumnsMeta(meta);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
      }),
    })
      .then(res => res.json())
      .then(newTask => {
        newTask.color = columnsMeta['todo']?.color || '#ccc';
        setColumns(prev => ({
          ...prev,
          todo: [newTask, ...prev.todo],
        }));
        setNewTaskTitle('');
        setNewTaskDescription('');
      })
      .catch(err => console.error('Error adding task:', err));
  };

  const editTask = (taskId, columnId, updatedData) => {
    fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
      })
      .then(updatedTask => {
        const colId = updatedTask.column || columnId;
        updatedTask.color = columnsMeta[colId]?.color || '#ccc';
        setColumns(prev => {
          const newCols = {};
          for (const col in prev) {
            newCols[col] = prev[col].filter(t => t.id !== taskId);
          }
          newCols[colId] = [updatedTask, ...newCols[colId]];
          return newCols;
        });
      })
      .catch(err => console.error('Error editing task:', err));
  };

  const deleteTask = (taskId) => {
    fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' })
      .then(res => {
        if (res.status === 204) {
          setColumns(prev => {
            const newCols = {};
            for (const col in prev) {
              newCols[col] = prev[col].filter(task => task.id !== taskId);
            }
            return newCols;
          });
        } else {
          console.error('Failed to delete task');
        }
      })
      .catch(err => console.error('Error deleting task:', err));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const startTasks = Array.from(columns[source.droppableId]);
    const [movedTask] = startTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // No backend position update — just rearrange in UI
      startTasks.splice(destination.index, 0, movedTask);
      setColumns(prev => ({
        ...prev,
        [source.droppableId]: startTasks,
      }));
    } else {
      const endTasks = Array.from(columns[destination.droppableId]);
      endTasks.splice(destination.index, 0, movedTask);

      fetch(`${API_BASE}/tasks/${movedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column: destination.droppableId,
        }),
      })
        .then(res => res.json())
        .then(() => {
          setColumns(prev => ({
            ...prev,
            [source.droppableId]: startTasks,
            [destination.droppableId]: endTasks,
          }));
        });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Georgia, serif' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {Object.entries(columns).map(([colId, tasks]) => (
            <Column
              key={colId}
              columnId={colId}
              droppableId={colId}
              title={columnsMeta[colId]?.title || colId}
              tasks={tasks}
              color={columnsMeta[colId]?.color || '#ccc'}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      <div style={{ marginTop: 20, maxWidth: 320 }}>
        <input
          type="text"
          placeholder="Enter title"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: 8,
            marginBottom: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
          }}
        />
        <textarea
          placeholder="Task description (optional)"
          value={newTaskDescription}
          onChange={e => setNewTaskDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            resize: 'vertical',
          }}
        />
        <button
          onClick={addTask}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            backgroundColor: '#007BA7',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
          }}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

export default App;
