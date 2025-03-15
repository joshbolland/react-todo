import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { initializeFirebase } from "./FBConfig";

export default function TaskList({
  categories,
  tasks,
  setTasks,
  allTasks,
  setAllTasks,
  user,
  firebaseConfig,
}) {
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { db } = initializeFirebase(firebaseConfig);

  const userTasksRef = useMemo(
    () => (user ? collection(db, "users", user.uid, "tasks") : null),
    [user, db]
  );

  useEffect(() => {
    if (!user || !userTasksRef) return;

    const fetchTasks = async () => {
      const querySnapshot = await getDocs(userTasksRef);
      const userTasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(userTasks);
    };

    fetchTasks();
  }, [user, userTasksRef, setTasks]);

  const addTask = async () => {
    if (!taskDescription || !user) return;

    const newTask = {
      description: taskDescription,
      category: selectedCategory,
      completed: false,
    };

    const docRef = await addDoc(userTasksRef, newTask);
    setTasks([...tasks, { id: docRef.id, ...newTask }]);
    setAllTasks([...allTasks, { id: docRef.id, ...newTask }]);
    setTaskDescription("");
  };

  const completeTask = async (taskId, completed) => {
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, { completed: !completed });

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      )
    );
  };

  return (
    <div className="w-2/3 flex flex-col items-start ml-5">
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
          className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
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
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => completeTask(task.id, task.completed)}
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
