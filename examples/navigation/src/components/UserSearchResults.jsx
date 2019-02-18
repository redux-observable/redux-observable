import React from 'react'
import { Link } from 'react-router-dom'

const UserSearchResults = ({ results, loading }) => (
  <ul
    style={{
      opacity: loading ? 0.3 : 1
    }}
  >
    {results.map(result => (
      <li key={result.id}>
        <Link to={`/repos/${result.login}`}>{result.login}</Link>
      </li>
    ))}
  </ul>
)

export default UserSearchResults
