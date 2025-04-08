import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export function Modal({
  open,
  setOpen,
  taskDescription,
  setTaskDescription,
  addTask,
  closeModal,
  selectedCategory,
  setSelectedCategory,
  categories,
  targetDate,
  setTargetDate,
}) {
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
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
                    Create new task
                  </DialogTitle>
                  <label>Description</label>
                  <input
                    className="bg-gray-100 rounded-lg p-3 mb-4 mt-1 text-sm"
                    placeholder="Enter description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                  <label>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-white bg-[#88A39D] hover:bg-[#6D8F8B] rounded-lg text-sm px-2 py-2.5 mb-4 mt-1 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category, index) => (
                      <option key={index}>{category}</option>
                    ))}
                  </select>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-gray-100 rounded-lg p-2 mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 flex flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => addTask(targetDate)}
                className="inline-flex justify-center rounded-md cursor-pointer bg-[#7f54ff] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#9b78ff] ml-3 w-auto"
              >
                Save
              </button>
              <button
                type="button"
                data-autofocus
                onClick={closeModal}
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset cursor-pointer hover:bg-gray-50 mt-0 w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
