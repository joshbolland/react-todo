import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Modal } from "./Modal";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { initializeFirebase } from "../config/FBConfig";
import { Task, FirebaseConfig, Category } from "../types/types";
import { User } from "firebase/auth";

const PlusCircleIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.PlusCircle }))
);
const TrashIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.Trash2 }))
);

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: User | null;
  firebaseConfig: FirebaseConfig | null;
  categories: Category[];
  isDesktop: boolean;
}

export default function TaskList({
  tasks,
  setTasks,
  user,
  firebaseConfig,
  categories,
  isDesktop,
}: TaskListProps) {
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const db = useMemo(() => {
    if (!firebaseConfig) return null;
    return initializeFirebase(firebaseConfig).db;
  }, [firebaseConfig]);

  const openModal = () => setOpen(true);

  const closeModal = () => {
    setOpen(false);
    setTaskDescription("");
    setSelectedCategory("");
    setTargetDate("");
  };

  const userTasksRef = useMemo(
    () => (user && db ? collection(db, "users", user.uid, "tasks") : null),
    [user, db]
  );

  useEffect(() => {
    if (!user || !userTasksRef) return;

    const fetchTasks = async () => {
      const querySnapshot = await getDocs(userTasksRef);
      const userTasks: Task[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));
      setTasks(userTasks);
    };

    fetchTasks();
  }, [user, userTasksRef, setTasks]);

  const addTask = async (targetDate: string | null) => {
    const sanitizedDescription = taskDescription.trim();
    const sanitizedCategory = selectedCategory.trim();
    const sanitizedDate = targetDate?.trim() || null;

    if (!sanitizedDescription || !sanitizedCategory || !sanitizedDate || !user || !userTasksRef) return;

    const newTask = {
      description: sanitizedDescription,
      category: sanitizedCategory,
      completed: false,
      targetDate: sanitizedDate,
    };

    const docRef = await addDoc(userTasksRef, newTask);
    setTasks([...tasks, { id: docRef.id, description: sanitizedDescription, category: sanitizedCategory, completed: false, targetDate: sanitizedDate }]);
    closeModal();
  };

  const completeTask = async (taskId: string, completed: boolean) => {
    if (!db || !user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, { completed: !completed });

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      )
    );
  };

  const deleteTask = async (taskId: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await deleteDoc(taskRef);
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const category = task.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {});

  const sortTasks = (taskList: Task[]) =>
    taskList.sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      return a.id.localeCompare(b.id);
    });

  return (
    <div
      className={`flex flex-col items-start ml-5 ${isDesktop ? "w-3/4" : "w-full"}`}
    >
      <div className="mb-5 w-1/2 flex">
        <button
          className="inline-flex w-auto justify-center rounded-md bg-[#7f54ff] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#9b78ff] cursor-pointer sm:w-auto"
          onClick={openModal}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PlusCircleIcon className="w-5 h-5 mr-2" />
          </Suspense>
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
                  className="w-full py-3 group"
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => completeTask(task.id, task.completed)}
                        className="appearance-none self-center item w-5 h-5 border border-gray-500 rounded-full checked:bg-[#7f54ff] checked:border-[#9b78ff]"
                      />
                      <div className="ml-3 text-left">
                        <span className={`${task.completed ? "line-through text-gray-500" : ""}`}>
                          {task.description}
                        </span>
                        {task.targetDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(task.targetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Suspense fallback={null}>
                      <button
                        className="ml-4 mr-4 p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-100 hidden group-hover:inline-block self-center cursor-pointer"
                        onClick={() => {
                          setConfirmDeleteId(task.id);
                          setShowConfirmModal(true);
                        }}
                        aria-label="Delete Task"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </Suspense>
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
      {showConfirmModal && (
        <Dialog open={showConfirmModal} onClose={setShowConfirmModal} className="relative z-10">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-left sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden w-[80vw] rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="bg-white px-4 pt-5 pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="flex flex-col w-full mt-3 text-left">
                      <DialogTitle
                        as="h1"
                        className="text-2xl font-semibold text-gray-900 mb-4"
                      >
                        Confirm Deletion
                      </DialogTitle>
                      <p className="text-gray-700 mb-4">
                        Are you sure you want to delete this task?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                          onClick={() => {
                            if (confirmDeleteId) {
                              deleteTask(confirmDeleteId);
                            }
                            setShowConfirmModal(false);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                          onClick={() => {
                            setShowConfirmModal(false);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
