import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';

function TaskCard({ task, index, columnId, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const wrapperRef = useRef(null);

  useEffect(()=>{
    setEditedTitle(task.title);
    setEditedDescription(task.description||'');
  },[task.title, task.description]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (editedTitle.trim() === '') {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setIsEditing(false);
      return;
    }
    onEdit(task.id, columnId, { title: editedTitle, description: editedDescription });
    setIsEditing(false);
  };

  // Handle blur on the wrapper div: save edits only if focus moves outside wrapper
  const handleWrapperBlur = (e) => {
    // relatedTarget = element receiving focus next
    if (!e.currentTarget.contains(e.relatedTarget)) {
      saveEdits();
    }
  };

  // Save on Enter key for title input, but allow multiline in description
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdits();
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            backgroundColor: snapshot.isDragging
              ? 'rgba(0,0,0,0.2)'
              : getTaskCardColor(columnId),
            color: 'white',
            padding: 10,
            marginBottom: 10,
            borderRadius: 4,
            boxShadow: snapshot.isDragging
              ? '0 4px 8px rgba(0,0,0,0.2)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'grab',
            fontFamily: 'Georgia, serif',
            ...provided.draggableProps.style,
          }}
        >
          {!isEditing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{task.title}</strong>
                <div>
                  <button onClick={startEditing} aria-label="Edit task" style={iconButtonStyle}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(task.id, columnId)} aria-label="Delete task" style={iconButtonStyle}>
                    🗑️
                  </button>
                </div>
              </div>
              {task.description && <p>{task.description}</p>}
            </>
          ) : (
            <div tabIndex={-1} onBlur={handleWrapperBlur} ref={wrapperRef}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                style={{
                  width: '100%',
                  marginBottom: 8,
                  fontFamily: 'Georgia, serif',
                  fontSize: 16,
                }}
                autoFocus
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                style={{
                  width: '100%',
                  fontFamily: 'Georgia, serif',
                  fontSize: 14,
                }}
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  marginLeft: 8,
};

const getTaskCardColor = (columnId) => {
  switch (columnId) {
    case 'todo':
      return '#007BA7'; // Cerulean Blue
    case 'inProgress':
      return '#FFA700'; // Chrome Yellow
    case 'done':
      return '#228B22'; // Forest Green (dark green)
    default:
      return '#ccc';
  }
};

export default TaskCard;
