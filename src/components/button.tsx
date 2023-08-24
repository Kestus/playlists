import type { MouseEventHandler } from "react";

interface inputOptions {
  onclick?: MouseEventHandler;
  loadingState?: boolean;
  color?: string;
  message: string;
}
const Button = (input: inputOptions) => {
  const loadingState = input.loadingState ? input.loadingState : false;
  const onClickHandler = input.onclick ? input.onclick : undefined
  const color = input.color ? input.color : "cyan"  

  return (
    <button
      onClick={onClickHandler}
      className={`rounded
                      border-b-2
                      px-2
                      font-sans
                      font-semibold
                      text-slate-50
                      transition-colors
                      duration-500
                      ease-out
                      ${
                        !!loadingState
                          ? `border-grey-800 
                          bg-grey-600
                          hover:bg-grey-500
                          cursor-wait
                        `
                          : `border-${color}-800 
                          bg-${color}-600
                          hover:bg-${color}-500
                          `
                      }
                    `}
    >
      {input.message}
    </button>
  );
};

export default Button;
