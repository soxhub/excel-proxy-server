import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import './index.scss'
import App from './App'
import * as serviceWorker from './serviceWorker'
import PropTypes from 'prop-types'

// optional cofiguration
const options = {
    // you can also just use 'bottom center'
    position: positions.TOP_RIGHT,
    timeout: 5000,
    offset: '30px',
    type: PropTypes.oneOf(['success', 'error']),
    // you can also just use 'scale'
    transition: transitions.SCALE,
}

ReactDOM.render(
    <AlertProvider template={AlertTemplate} {...options}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </AlertProvider>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
