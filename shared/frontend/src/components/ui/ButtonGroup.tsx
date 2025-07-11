import React from 'react';

type ButtonGroupProps = {
  buttons: string[];
  onButtonClick: (button: string) => void;
  activeButton: string;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons, onButtonClick, activeButton }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Time interval selector">
      {buttons.map((button, index) => (
        <button
          key={button}
          type="button"
          onClick={() => onButtonClick(button)}
          aria-pressed={activeButton === button}
          className={`px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
            ${index === 0 ? 'rounded-l-lg' : ''}
            ${index === buttons.length - 1 ? 'rounded-r-lg' : ''}
            ${
              activeButton === button
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                : 'bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }
            border-t border-b border-gray-200 dark:border-gray-600 ${index > 0 ? 'border-l' : ''}
          `}
        >
          {button}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup; 