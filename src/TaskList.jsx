import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { initializeFirebase } from "./FBConfig";
import { PlusCircle } from "lucide-react";

export default function TaskList({
  tasks,
  setTasks,
  user,
  firebaseConfig,
  categories,
}) {
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { db } = initializeFirebase(firebaseConfig);
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState("");

  const openModal = () => setOpen(true);

  const closeModal = () => {
    setOpen(false);
    setTaskDescription("");
    setSelectedCategory("");
    setTargetDate("");
  };

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

  const addTask = async (targetDate) => {
    if (!taskDescription || !user) return;

    const newTask = {
      description: taskDescription,
      category: selectedCategory,
      completed: false,
      targetDate: targetDate || null,
    };

    const docRef = await addDoc(userTasksRef, newTask);
    setTasks([...tasks, { id: docRef.id, ...newTask }]);
    closeModal();
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

  const groupedTasks = tasks.reduce((acc, task) => {
    const category = task.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {});

  const sortTasks = (taskList) =>
    taskList.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed - b.completed;
      return a.id.localeCompare(b.id);
    });

  return (
    <div className="w-2/3 flex flex-col items-start ml-5">
      <div className="mb-5 w-1/2 flex">
        <button
          className="inline-flex w-full justify-center rounded-md bg-[#7f54ff] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#9b78ff] cursor-pointer sm:w-auto"
          onClick={openModal}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New task
        </button>
      </div>
      <div className="w-full">
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg text-left font-semibold text-gray-800 pb-2 border-b border-gray-300">
              {category}
            </h2>
            <ul>
              {sortTasks(tasks).map((task, index) => (
                <li
                  key={index}
                  className={`flex items-center py-3 ${
                    index !== 0 ? "border-t border-gray-300" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => completeTask(task.id, task.completed)}
                        className="appearance-none self-center item w-5 h-5 border border-gray-500 rounded-full checked:bg-[#7f54ff] checked:border-[#9b78ff]"
                      />
                      <span
                        className={`ml-3 ${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.description}
                      </span>
                    </div>
                    <div>
                      {task.targetDate && (
                        <p className="text-sm text-gray-500 text-left ml-8">
                          {new Date(task.targetDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        setOpen={setOpen}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        addTask={addTask}
        closeModal={closeModal}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
      />
    </div>
  );
}
