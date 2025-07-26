import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Admins from './pages/Admins';
import Games from './pages/Games';
import Results from './pages/Results';
import Withdrawals from './pages/Withdrawals';
import Transactions from './pages/Transactions';
import QRCodes from './pages/QRCodes';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Logout from './pages/Logout';
import Profile from './pages/Profile';
import NumberSelections from './pages/NumberSelections';
import AuditLogs from './pages/AuditLogs';

function App() {
  // TODO: Add authentication logic and protected routes
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/users" component={Users} />
          <Route path="/admins" component={Admins} />
          <Route path="/games" component={Games} />
          <Route path="/results" component={Results} />
          <Route path="/withdrawals" component={Withdrawals} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/qrcodes" component={QRCodes} />
          <Route path="/settings" component={Settings} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/reports" component={Reports} />
          <Route path="/logout" component={Logout} />
          <Route path="/profile" component={Profile} />
          <Route path="/number-selections" component={NumberSelections} />
          <Route path="/audit-logs" component={AuditLogs} />
          {/* Add other routes here */}
          <Redirect from="/" to="/login" />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
