import React from 'react';

function Input({ label, type, placeholder }) {
  return (
    <>
      <label htmlFor={label} title={label}>{label}</label>
      <input for type={type} placeholder={placeholder}/>
    </>
  );
}

export default Input;
