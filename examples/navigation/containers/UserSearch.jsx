import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import UserSearchInput from '../components/UserSearchInput';
import UserSearchResults from '../components/UserSearchResults';
import { searchUsers } from '../actions';

class UserSearch extends React.Component {
  constructor(props) {
    super(props);
    this.handleUserSearch = this.handleUserSearch.bind(this);
  }

  componentDidMount() {
    this.handleUserSearch(this.props.query);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.query !== nextProps.query) {
      this.handleUserSearch(nextProps.query);
    }
  }

  handleUserSearch(query) {
    this.props.searchUsers(query);
  }

  render() {
    const {
      query,
      results,
      searchInFlight
    } = this.props;
    return (
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
          defaultValue={query}
          onChange={this.handleUserSearch}
        />
        <UserSearchResults
          results={results}
          loading={searchInFlight}
        />
      </div>
    );
  }
}

export default connect(
  ({ routing, userResults, searchInFlight }) => ({
    query: routing.locationBeforeTransitions.query.q,
    results: userResults,
    searchInFlight
  }),
  { searchUsers }
)(UserSearch);
