import React from 'react'

const UserSearchInput = ({ defaultValue, onChange }) => (
  <input
    type="text"
    placeholder="Search for a GH user"
    defaultValue={defaultValue}
    onChange={evt => onChange(evt.target.value)}
  />
)

export default UserSearchInput
