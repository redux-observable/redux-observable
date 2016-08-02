import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import UserSearchInput from '../components/UserSearchInput';
import UserSearchResults from '../components/UserSearchResults';

function onSearch(query) {
  return push(`?q=${query}`);
}

function onSelect(user) {
  return push(`repos/${user}`);
}

const UserSearch = ({
  query = '',
  results,
  onSearch,
  searchInFlight
}) => (
  <div>
    <Link
      to='/admin'
      style={{
        display: 'block',
        marginBottom: 10
      }}>
      Admin Panel
    </Link>
    <UserSearchInput
      value={query}
      onChange={onSearch}
    />
    <UserSearchResults
      results={results}
      loading={searchInFlight}
      onSelect={onSelect}
    />
  </div>
);

export default connect(
  ({ routing, userResults, searchInFlight }) => ({
    query: routing.locationBeforeTransitions.query.q,
    results: userResults,
    searchInFlight
  }),
  { onSearch }
)(UserSearch);
