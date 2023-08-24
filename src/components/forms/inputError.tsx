import { Transition } from "@headlessui/react";

const InputError = (params: {
  conditon: boolean | undefined;
  message: string;
}) => {
  return (
    <Transition
      show={params.conditon}
      enter="transition-opacity duration-500 ease-in"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500 ease-out"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {params.conditon && (
        <div className="flex w-auto justify-center rounded-md border-2 border-l-2 border-r-2 border-red-500 bg-red-400">
          <span className="font-mono text-lg font-semibold text-slate-100 ">
            {params.message}
          </span>
        </div>
      )}
    </Transition>
  );
};

export default InputError;
