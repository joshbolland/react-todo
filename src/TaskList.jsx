import { useState } from "react";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");

  function addTask() {
    if (taskDescription) {
      setTasks([...tasks, { description: taskDescription, completed: false }]);
      setTaskDescription("");
    }
  }

  function completeTask(index) {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  }

  return (
    <div className="w-2/3 flex flex-col items-start ml-5 ">
      <h1 className="text-3xl font-bold text-purple-400 mb-2.5">To Do</h1>
      <div className="mb-5 w-1/2">
        <input
          className="bg-gray-200 rounded-sm p-1.5 w-full"
          type="text"
          placeholder="Add new task..."
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              addTask();
            }
          }}
        />
      </div>
      <ul className="text-left">
        {tasks.map((task, index) => (
          <li key={index}>
            {" "}
            <input
              type="checkbox"
              value={task.completed}
              onChange={() => completeTask(index)}
            />
            <span
              className="pl-1.5"
              style={task.completed ? { textDecoration: "line-through" } : {}}
            >
              {task.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
