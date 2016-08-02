import React from 'react';
import { connect } from 'react-redux';
import Repos from '../components/Repos';

function loading(reposByUser, user) {
  return reposByUser.hasOwnProperty(user) && !reposByUser[user];
}

const ReposByUser = ({ reposByUser, user }) => {
  if (loading(reposByUser, user)) {
    return (
      <p>Loading</p>
    );
  }
  return (
    <Repos
      repos={reposByUser[user]}
      user={user}
    />
  );
};

export default connect(
  ({ reposByUser }, ownProps) => ({
    reposByUser,
    user: ownProps.params.user
  })
)(ReposByUser);
