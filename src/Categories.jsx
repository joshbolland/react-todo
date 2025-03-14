import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { initializeFirebase } from "./FBConfig";

export default function Categories({
  categories,
  setCategories,
  setTasks,
  user,
  firebaseConfig,
}) {
  const [categoryDescription, setCategoryDescription] = useState("");
  const [open, setOpen] = useState(false);
  const { db } = initializeFirebase(firebaseConfig);

  const userCategoriesRef = useMemo(
    () => (user ? collection(db, "users", user.uid, "categories") : null),
    [user, db]
  );

  const userTasksRef = useMemo(
    () => (user ? collection(db, "users", user.uid, "tasks") : null),
    [user, db]
  );

  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(userCategoriesRef);
      const fetchedCategories = querySnapshot.docs.map(
        (doc) => doc.data().description
      );
      setCategories(fetchedCategories);
    };

    fetchCategories();
  }, [user, userCategoriesRef, setCategories]);

  const openModal = () => setOpen(true);

  const closeModal = () => setOpen(false);

  const addCategory = async () => {
    if (!categoryDescription || !user) return;

    const newCategory = {
      description: categoryDescription,
    };

    // Add new category to Firestore
    await addDoc(userCategoriesRef, newCategory);

    // Update local state with the new category
    setCategories([...categories, categoryDescription]);
    setCategoryDescription(""); // Clear input
    closeModal();
  };

  const filterTasks = async (category) => {
    if (!user) return;

    let tasksQuery;

    if (category) {
      // Query Firestore for tasks that match the category
      tasksQuery = query(userTasksRef, where("category", "==", category));
    } else {
      // Query Firestore for all tasks (no category filter)
      tasksQuery = query(userTasksRef);
    }

    const querySnapshot = await getDocs(tasksQuery);
    const fetchedTasks = querySnapshot.docs.map((doc) => doc.data());

    // Update tasks state with the filtered tasks
    setTasks(fetchedTasks);
  };

  return (
    <div className="w-1/3 min-h-full pt-8 border-r-2 border-r-gray-200 flex flex-col items-center">
      <ul className="w-full text-left pl-20">
        <li
          onClick={() => filterTasks(null)}
          className="mt-2.5 mb-2.5 font-bold text-xl cursor-pointer"
        >
          All Tasks
        </li>
        {categories.map((category, index) => (
          <li
            onClick={() => filterTasks(category)}
            key={index}
            className="mt-2.5 mb-2.5"
          >
            <span className="text-xl cursor-pointer">{category}</span>
          </li>
        ))}
      </ul>
      <div className="w-full text-left pl-20 mt-2.5">
        <button className="text-gray-400 cursor-pointer" onClick={openModal}>
          + New Category
        </button>
      </div>

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      New Category
                    </DialogTitle>
                    <div className="mt-2">
                      <input
                        placeholder="New category..."
                        className="bg-gray-200 rounded-sm p-1"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        onKeyUp={(event) => {
                          if (event.key === "Enter") {
                            addCategory();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-purple-500 sm:ml-3 sm:w-auto"
                >
                  Save
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={closeModal}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
