from backend.models import Task, Column

# Columns with fixed metadata
columns = [
    Column(columnId="todo", title="To Do", color="#007BA7"),
    Column(columnId="inProgress", title="In Progress", color="#FFB300"),
    Column(columnId="done", title="Done", color="#228B22"),
]

# Tasks stored in dictionary by columnId
tasks = {
    "todo": [],
    "inProgress": [],
    "done": [],
}

def find_task(task_id):
    for col_tasks in tasks.values():
        for task in col_tasks:
            if task.id == task_id:
                return task
    return None

def delete_task(task_id):
    for col_id, col_tasks in tasks.items():
        for i, task in enumerate(col_tasks):
            if task.id == task_id:
                del col_tasks[i]
                return True
    return False
