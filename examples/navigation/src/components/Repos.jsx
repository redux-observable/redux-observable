import React from 'react'

const Repos = ({ repos, user }) => (
  <ul>
    {repos.length ? (
      repos.map(repo => (
        <li key={repo.id}>
          <a href={repo.html_url} target="__blank">
            {repo.full_name}
          </a>
        </li>
      ))
    ) : (
      <p>{user} has no repos</p>
    )}
  </ul>
)

export default Repos
