import type { MouseEventHandler } from "react";

interface inputOptions {
  onclick?: MouseEventHandler;
  loadingState?: boolean;
  message: string;
}
const Button = (input: inputOptions) => {
  const loadingState = input.loadingState ? input.loadingState : false;
  const onClickHandler = input.onclick ? input.onclick : undefined;

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
                      ${!loadingState && `border-cyan-800 bg-cyan-600 hover:bg-cyan-500`}
                      ${!!loadingState && `border-grey-800 bg-grey-600 hover:bg-grey-500 cursor-wait`}
                    `}
    >
      {input.message}
    </button>
  );
};

export default Button;
