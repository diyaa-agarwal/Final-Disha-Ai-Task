from pydantic import BaseModel
from typing import Optional

class Column(BaseModel):
    columnId: str
    title: str
    color: str

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str]
    column: str
    # position: float

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ''
    

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column: Optional[str] = None

