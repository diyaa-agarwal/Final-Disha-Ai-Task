import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

function Column({ columnId, droppableId, title, tasks, color, onEdit, onDelete }) {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 4,
        width: 300,
        minHeight: 400,
        padding: 10,
        backgroundColor: 'white', // white background as you requested
      }}
    >
      {/* Column title with same color as task cards */}
      <h2
        style={{
          marginLeft: 10, // align with task cards' left edge (task cards have 10px padding)
          color: color,
          fontFamily: 'Georgia, serif',
        }}
      >
        {title}
      </h2>

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: 300,
              backgroundColor: snapshot.isDraggingOver ? '#e0f7fa' : undefined,
              padding: 8,
              borderRadius: 4,
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                columnId={columnId}
                onEdit={onEdit}
                onDelete={onDelete}
              />

            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;
