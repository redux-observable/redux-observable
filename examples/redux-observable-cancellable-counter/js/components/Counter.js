/*eslint-disable no-unused-vars*/
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  INCREMENT,
  DECREMENT,
  INCREMENT_IF_ODD,
  INCREMENT_ASYNC,
  CANCEL_INCREMENT_ASYNC,
  HIDE_CONGRATULATION,
  START_COUNTDOWN
} from '../actionTypes'


function Counter({counter, countdown, congratulate, dispatch}) {

      const action = (type, value) => () => dispatch({type, value});

      return (
        <div>
          Clicked: {counter} times
          {' '}
          <button onClick={action(INCREMENT)}>+</button>
          {' '}
          <button onClick={action(DECREMENT)}>-</button>
          {' '}
          <button onClick={action(INCREMENT_IF_ODD)}>Increment if odd</button>
          {' '}
          <button
            onClick={countdown ? action(CANCEL_INCREMENT_ASYNC) : action(START_COUNTDOWN)}
            style={{color: countdown ? 'red' : 'black'}}>

            {countdown ? `Cancel increment (${countdown})` : 'increment after 5s'}
          </button>
        </div>
      )
}



Counter.propTypes = {
  // dispatch actions
  dispatch: PropTypes.func.isRequired,
  // state
  counter: PropTypes.number.isRequired,
  countdown: PropTypes.number.isRequired
}

function mapStateToProps(state) {
  return {
    counter: state.counter,
    countdown: state.countdown
  }
}

export default connect(mapStateToProps)(Counter)
