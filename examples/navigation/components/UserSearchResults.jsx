import React from 'react';
import { Link } from 'react-router';

export default function UserSearchResults({
  results,
  loading,
  onSelect
}) {
  return (
    <ul style={{
      opacity: loading ? 0.3 : 1
    }}>
      {results.map(result => (
        <li key={result.id}>
          <Link to={`/repos/${result.login}`}>
            {result.login}
          </Link>
        </li>
      ))}
    </ul>
  );
}
