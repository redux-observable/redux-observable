import React from 'react';

export default function UserSearchInput({ value, defaultValue, onChange }) {
  return (
    <input
      type='text'
      placeholder='Search for a GH user'
      defaultValue={defaultValue}
      onChange={(evt) => onChange(evt.target.value)}
    />
  );
}
