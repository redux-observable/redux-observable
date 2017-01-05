import React from 'react';
import { connect } from 'react-redux';
import Repos from '../components/Repos';
import { requestReposByUser } from '../actions';

class ReposByUser extends React.Component {
  componentDidMount() {
    this.props.requestReposByUser(this.props.params.user);
  }

  render() {
    const {
      reposByUser,
      user
    } = this.props;
    if (!reposByUser[user]) {
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
  }
}

export default connect(
  ({ reposByUser }, ownProps) => ({
    reposByUser,
    user: ownProps.params.user
  }),
  { requestReposByUser }
)(ReposByUser);
