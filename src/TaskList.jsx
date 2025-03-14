import { useState } from "react";

export default function TaskList({ categories, tasks, setTasks, setAllTasks }) {
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  function addTask() {
    if (taskDescription) {
      const newTask = {
        description: taskDescription,
        category: selectedCategory,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setAllTasks([...tasks, newTask]);
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
      <div className="mb-5 w-1/2 flex">
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <option value="" disabled>
            Select a category...
          </option>
          {categories.map((category, index) => (
            <option key={index}>{category}</option>
          ))}
        </select>
      </div>
      <ul className="text-left">
        {tasks.map((task, index) => (
          <li key={index}>
            {" "}
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => completeTask(index)}
            />
            <span
              className="pl-1.5"
              style={task.completed ? { textDecoration: "line-through" } : {}}
            >
              {task.description}
            </span>
            <span className="text-xs text-white bg-green-500 rounded-xl pl-3 pr-3 pt-1 pb-1 ml-1.5">
              {task.category}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
