import React from "react";
import "./App.css";
import TaskList from "./TaskList";
import Categories from "./Categories";
import { useState } from "react";

function App() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  return (
    <div className="flex w-full min-h-lvh">
      <Categories
        categories={categories}
        setCategories={setCategories}
        tasks={tasks}
        setTasks={setTasks}
        allTasks={allTasks}
      />
      <TaskList
        categories={categories}
        tasks={tasks}
        setTasks={setTasks}
        setAllTasks={setAllTasks}
      />
    </div>
  );
}

export default App;
