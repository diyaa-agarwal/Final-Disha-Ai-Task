from fastapi import APIRouter, HTTPException
from uuid import uuid4
from typing import List
from backend.models import Task, TaskCreate, TaskUpdate
import backend.memory

router = APIRouter()

@router.get("/columns")
def get_columns_and_tasks():
    # Return all columns with their tasks
    return {
        "columns": backend.memory.columns,
        "tasks": backend.memory.tasks
    }

from typing import List

@router.get("/tasks", response_model=List[Task])
def get_all_tasks():
    all_tasks = []
    for task_list in backend.memory.tasks.values():
        all_tasks.extend(task_list)
    return all_tasks


@router.post("/tasks", response_model=Task)
def create_task(task_create: TaskCreate):
    task_id = str(uuid4())
    task = Task(
        id=task_id,
        title=task_create.title,
        description=task_create.description,
        column="todo"
    )
    backend.memory.tasks["todo"].insert(0, task)
    return task

@router.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task_update: TaskUpdate):
    task = backend.memory.find_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Remove task from old column if column changes
    if task_update.column and task_update.column != task.column:
        backend.memory.tasks[task.column].remove(task)
        task.column = task_update.column
        # Update color is managed in frontend, backend just tracks column

        backend.memory.tasks[task.column].insert(0, task)  # Insert at start of new column

    # Update title and description if provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description

    return task

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    deleted = backend.memory.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return