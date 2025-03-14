import React from "react";
import "./App.css";
import TaskList from "./TaskList";
import Categories from "./Categories";

function App() {
  return (
    <div className="flex w-full min-h-lvh">
      <Categories />
      <TaskList />
    </div>
  );
}

export default App;
