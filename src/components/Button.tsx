import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  bgColor?: string;
  textColor?: string;
  width?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  bgColor = 'bg-white',
  textColor = 'text-black',
  className = '',
  width = '',
  ...rest
}) => {
  return (
    <button
      className={`py-3 px-10 rounded-3xl ${width} ${bgColor} ${textColor} ${className}`}
      {...rest}
    >
      {text}
    </button>
  );
};

export default CustomButton;
