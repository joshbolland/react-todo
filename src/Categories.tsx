import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { collection, getDocs, addDoc, query, where, doc, deleteDoc } from "firebase/firestore";
import { initializeFirebase } from "./FBConfig";
import { Task, FirebaseConfig, Category } from "./types";
import { User } from "firebase/auth";

const MenuIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.Menu }))
);

const XIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.X }))
);


const TrashIcon = lazy(() =>
  import("lucide-react").then((module) => ({ default: module.Trash2 }))
);

interface CategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  user: User | null;
  firebaseConfig: FirebaseConfig | null;
  sidebarIsOpen: boolean;
  setSidebarIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDesktop: boolean;
  setIsDesktop: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Categories({
  categories,
  setCategories,
  setTasks,
  user,
  firebaseConfig,
  sidebarIsOpen,
  setSidebarIsOpen,
  isDesktop,
  setIsDesktop,
}: CategoriesProps) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSidebarIsOpen(false); // Close by default on mobile
      } else {
        setSidebarIsOpen(true); // Open by default on desktop
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarIsOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsDesktop(false); // Close by default on mobile
      } else {
        setIsDesktop(true); // Open by default on desktop
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsDesktop]);

  const [categoryDescription, setCategoryDescription] = useState("");
  const [confirmCategoryId, setConfirmCategoryId] = useState<string | null>(null);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);

  const db = useMemo(() => {
    if (!firebaseConfig) return null;
    return initializeFirebase(firebaseConfig).db;
  }, [firebaseConfig]);

  const userCategoriesRef = useMemo(
    () => (user && db ? collection(db, "users", user.uid, "categories") : null),
    [user, db]
  );

  const userTasksRef = useMemo(
    () => (user && db ? collection(db, "users", user.uid, "tasks") : null),
    [user, db]
  );

  useEffect(() => {
    if (!user || !userCategoriesRef) return;

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(userCategoriesRef);
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        description: doc.data().description,
      }));
      setCategories(fetchedCategories);
    };

    fetchCategories();
  }, [user, userCategoriesRef, setCategories]);

  const addCategory = async () => {
    const sanitizedDescription = categoryDescription.trim();
    if (
      !sanitizedDescription ||
      sanitizedDescription.length > 50 ||
      !user ||
      !userCategoriesRef
    )
      return;

    const newCategory = {
      description: sanitizedDescription,
    };

    const newDocRef = await addDoc(userCategoriesRef, newCategory);

    setCategories([
      ...categories,
      { id: newDocRef.id, description: sanitizedDescription },
    ]);
    setCategoryDescription("");
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user || !db) return;
    const categoryRef = doc(db, "users", user.uid, "categories", categoryId);
    await deleteDoc(categoryRef);
    setCategories(categories.filter((cat) => cat.id !== categoryId));

    // Also remove tasks associated with the deleted category from task list state
    if (!userTasksRef) return;
    const querySnapshot = await getDocs(userTasksRef);
    const remainingTasks = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, 'id'>),
      }))
      .filter((task) => task.category !== categories.find((c) => c.id === categoryId)?.description);

    setTasks(remainingTasks);
  };

  const filterTasks = async (category: string | null) => {
    if (!user || !userTasksRef) return;

    let tasksQuery;

    if (category) {
      tasksQuery = query(userTasksRef, where("category", "==", category));
    } else {
      tasksQuery = query(userTasksRef);
    }

    const querySnapshot = await getDocs(tasksQuery);
    const fetchedTasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, 'id'>),
    }));

    setTasks(fetchedTasks);

    if (sidebarIsOpen && !isDesktop) {
      setSidebarIsOpen(false);
    }
  };

  return (
    <div
      className={`min-h-full flex flex-col items-center bg-[#FCFAF8] ${isDesktop ? "w-1/4 pt-8" : "w-0"}`}
    >
      <aside
        className={`transform top-0 left-0 bg-[#FCFAF8] h-full fixed sm:static z-2 transition-transform duration-300 ease-in-out
          ${sidebarIsOpen ? "translate-x-0 w-2/3" : "-translate-x-full"} ${isDesktop ? "" : "shadow-lg"} sm:translate-x-0 max-w-full`}
      >
        <button
          className="sm:hidden p-2 m-2 w-full"
          onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
          aria-label="Toggle Sidebar"
        >
          <Suspense fallback={<div>Loading...</div>}>
            {sidebarIsOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </Suspense>
        </button>
        <ul
          className={`w-full text-left ${isDesktop ? "w-full" : "w-4/5 pl-10"}`}
        >
          <li
            onClick={() => filterTasks(null)}
            className="font-bold text-xl p-2 rounded-lg hover:bg-[#FFF0E5] w-11/12 cursor-pointer"
          >
            All Tasks
          </li>
          {categories.map((category, index) => (
            <li
              onClick={() => filterTasks(category.description)}
              key={index}
              className="p-2 rounded-lg hover:bg-[#FFF0E5] w-11/12 cursor-pointer flex justify-between items-center group"
            >
              <span className="text-xl">{category.description}</span>
              <Suspense fallback={null}>
                <button
                  className="ml-2 p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-100 hidden group-hover:inline-block cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmCategoryId(category.id);
                    setShowCategoryConfirmModal(true);
                  }}
                  aria-label="Delete Category"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </Suspense>
            </li>
          ))}
        </ul>
        <div
          className={`text-left mt-2.5 ${isDesktop ? "w-full" : "w-4/5 pl-10"}`}
        >
          <input
            className="bg-gray-100 rounded-sm p-1.5 w-full max-w-[200px] ml-2 box-border overflow-ellipsis"
            type="text"
            placeholder="Add new category..."
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                addCategory();
              }
            }}
            maxLength={50}
          />
        </div>
      </aside>
      {showCategoryConfirmModal && (
        <Dialog open={showCategoryConfirmModal} onClose={setShowCategoryConfirmModal} className="relative z-10">
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
                        Deleting this category will also remove all associated tasks. Are you sure?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                          onClick={() => {
                            if (confirmCategoryId) {
                              deleteCategory(confirmCategoryId);
                            }
                            setShowCategoryConfirmModal(false);
                            setConfirmCategoryId(null);
                          }}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                          onClick={() => {
                            setShowCategoryConfirmModal(false);
                            setConfirmCategoryId(null);
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
