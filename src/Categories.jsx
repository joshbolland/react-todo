import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { initializeFirebase } from "./FBConfig";

const MenuIcon = lazy(() => import("lucide-react").then((module) => ({ default: module.Menu })));

const XIcon = lazy(() => import("lucide-react").then((module) => ({ default: module.X })));

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
}) {
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
    if (!user || !userCategoriesRef) return;

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(userCategoriesRef);
      const fetchedCategories = querySnapshot.docs.map(
        (doc) => doc.data().description
      );
      setCategories(fetchedCategories);
    };

    fetchCategories();
  }, [user, userCategoriesRef, setCategories]);

  const addCategory = async () => {
    if (!categoryDescription || !user) return;

    const newCategory = {
      description: categoryDescription,
    };

    await addDoc(userCategoriesRef, newCategory);

    setCategories([...categories, categoryDescription]);
    setCategoryDescription("");
  };

  const filterTasks = async (category) => {
    if (!user) return;

    let tasksQuery;

    if (category) {
      tasksQuery = query(userTasksRef, where("category", "==", category));
    } else {
      tasksQuery = query(userTasksRef);
    }

    const querySnapshot = await getDocs(tasksQuery);
    const fetchedTasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTasks(fetchedTasks);

    if (sidebarIsOpen && !isDesktop) {
      setSidebarIsOpen(false);
    }
  };

  return (
    <div
      className={`min-h-full flex flex-col items-center bg-[#FCFAF8] ${isDesktop ? "w-1/3 pt-8" : "w-0"}`}
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
              onClick={() => filterTasks(category)}
              key={index}
              className="p-2 rounded-lg hover:bg-[#FFF0E5] w-11/12 cursor-pointer"
            >
              <span className="text-xl">{category}</span>
            </li>
          ))}
        </ul>
        <div
          className={`text-left mt-2.5 ${isDesktop ? "w-full" : "w-4/5 pl-10"}`}
        >
          <input
            className="bg-gray-100 rounded-sm p-1.5 w-full max-w-full ml-2 box-border"
            type="text"
            placeholder="Add new category"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                addCategory();
              }
            }}
          />
        </div>
      </aside>
    </div>
  );
}
