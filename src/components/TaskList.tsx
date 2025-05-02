import { isMobileDevice } from "../utils/isMobileDevice";
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
const PencilIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.Pencil }))
);

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: User | null;
  firebaseConfig: FirebaseConfig | null;
  categories: Category[];
  isDesktop: boolean;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function TaskList({
  tasks,
  setTasks,
  user,
  firebaseConfig,
  categories,
  isDesktop,
  selectedCategory,
  setSelectedCategory
}: TaskListProps) {
  const [taskDescription, setTaskDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [targetDate, setTargetDate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string |
    null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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
    const sanitizedCategory = selectedCategory ? selectedCategory.trim() : "";
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
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 text-sm italic text-center">
              {selectedCategory
                ? `You have no ${selectedCategory} tasks yet.`
                : "You have no tasks yet."} Add one using the "New task" button above!
            </p>
          </div>
        )}
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
                          <p
                            className={`text-sm mt-1 flex items-center gap-1 ${!task.completed && new Date(task.targetDate) < new Date()
                              ? "text-red-500"
                              : "text-gray-500"
                              }`}
                          >
                            {!task.completed && new Date(task.targetDate) < new Date() && (
                              <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Overdue
                              </span>
                            )}
                            {new Date(task.targetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Suspense fallback={null}>
                      <div className="flex self-center">

                        {isMobileDevice ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                              }}
                              aria-label="Toggle options"
                              className="ml-4 flex items-center self-center mr-2.5"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedTaskId === task.id ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            {expandedTaskId === task.id && (
                              <div className="flex gap-2 ml-2 self-center">
                                <button
                                  className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                                  onClick={() => setEditingTask(task)}
                                  aria-label="Edit Task"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  className="mr-2.5 rounded text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                                  onClick={() => {
                                    setConfirmDeleteId(task.id);
                                    setShowConfirmModal(true);
                                  }}
                                  aria-label="Delete Task"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button
                              className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                              onClick={() => setEditingTask(task)}
                              aria-label="Edit Task"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-100 cursor-pointer"
                              onClick={() => {
                                setConfirmDeleteId(task.id);
                                setShowConfirmModal(true);
                              }}
                              aria-label="Delete Task"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
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
        selectedCategory={selectedCategory ?? ""}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
      />
      {editingTask && (
        <Modal
          open={!!editingTask}
          setOpen={(isOpen) => {
            if (!isOpen) setEditingTask(null);
          }}
          taskDescription={editingTask.description}
          setTaskDescription={(desc) => {
            setEditingTask((prev) =>
              prev ? { ...prev, description: typeof desc === 'function' ? desc(prev.description) : desc } : null
            );
            return desc;
          }}
          selectedCategory={editingTask.category}
          setSelectedCategory={(cat) =>
            setEditingTask((prev) =>
              prev
                ? { ...prev, category: typeof cat === "function" ? cat(prev?.category ?? "") ?? "" : cat ?? "" }
                : null
            )
          }
          categories={categories}
          targetDate={editingTask.targetDate ?? ""}
          setTargetDate={(date) =>
            setEditingTask((prev) =>
              prev
                ? { ...prev, targetDate: typeof date === "function" ? date(prev.targetDate ?? "") : date }
                : null
            )
          }
          addTask={async () => {
            if (!editingTask || !db || !user) return;
            const taskRef = doc(db, "users", user.uid, "tasks", editingTask.id);
            await updateDoc(taskRef, {
              description: editingTask.description.trim(),
              category: editingTask.category.trim(),
              targetDate: editingTask.targetDate?.trim() || null,
            });
            setTasks((prev) =>
              prev.map((t) =>
                t.id === editingTask.id ? { ...t, ...editingTask } : t
              )
            );
            setEditingTask(null);
          }}
          closeModal={() => setEditingTask(null)}
        />
      )}
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
