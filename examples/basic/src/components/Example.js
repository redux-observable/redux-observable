import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUser, abortFetchUser } from '../actions';

const Example = ({ user, fetchUser, abortFetchUser }) => (
  <div>
    <button onClick={fetchUser}>fetch user</button>
    <button onClick={abortFetchUser}>abort fetch user</button>
    <div>Loading: {`${user.isLoading}`}</div>
    <pre>{JSON.stringify(user, null, 2)}</pre>
  </div>
);

const mapStateToProps = ({ user }) => ({ user });

const mapDispatchToProps = {
  fetchUser,
  abortFetchUser
};

export default connect(mapStateToProps, mapDispatchToProps)(Example);
