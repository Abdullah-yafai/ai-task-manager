import { useState } from "react";
import { Dialog } from "@headlessui/react";

const DetailCard = ({ task }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ✅ Task Card */}
      <div
        onClick={() => setOpen(true)}
        className="bg-gray-800 cursor-pointer hover:bg-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-200"
      >
        <h3 className="text-lg font-semibold text-white mb-2">
          {task.title?.slice(0, 50)}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3">
          {task.description?.slice(0, 120)}...
        </p>
        <div className="mt-3 text-xs text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>

        {task.generatedByAI && (
          <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full mt-2 inline-block">
            AI Generated
          </span>
        )}
      </div>

      {/* ✅ Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        {/* Modal Box */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-900 max-w-2xl w-full rounded-2xl shadow-2xl p-6 text-white">
            <Dialog.Title className="text-2xl font-bold mb-4">
              {task.title}
            </Dialog.Title>

            <div className="max-h-[60vh] overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm rounded-lg transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default DetailCard;
