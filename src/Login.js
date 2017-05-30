import React, {Component} from 'react';
import './login.css'

// const FAUNADB_CLIENT_SECRET = "replace me";

function saveTokens(faunadb_secret) {
  if(faunadb_secret) {
    localStorage.setItem('faunadb_secret', faunadb_secret);
  }
}

function clearTokens() {
  localStorage.removeItem('faunadb_secret');
}

function getTokens() {
  return {
    faunadb_secret: localStorage.getItem('faunadb_secret')
  }
}

class Login extends Component {
  state = {
  }
  componentWillMount() {
  }
  doRefresh() {
    // called from the model when the is an auth error
    console.log("doRefresh");
  }
  authorized(reload) {
    var tokens = getTokens();
    if (tokens.faunadb_secret) {
      tokens.doRefresh = this.doRefresh.bind(this)
      this.props.onAuthChange(tokens, reload)
    } else {
      this.props.onAuthChange({})
    }
  }
  signup () {
    this.setState({show:"Sign Up"});
  }
  login () {
    this.setState({show:"Login"});
  }
  doShownForm(e) {
    this["do"+this.state.show](e)
  }
  doLogin (e) {
    e.preventDefault();
    console.log(this.state)
    publicClient.query(q.Login(q.Match(q.Index("users_by_login"), this.state.login), {
        password : this.state.password
    })).then((key) => {
      saveTokens(key.secret);
      this.authorized(true);
    })
  }
  ["doSign Up"] (e) {
    e.preventDefault();
    console.log(this.state)
    publicClient.query(q.Create(q.Class("users"), {
      credentials : {
        password : this.state.password
      },
      data {
        login : this.state.login
      }
    })).then(() => publicClient.query(q.Login(q.Match(q.Index("users_by_login"), this.state.login), {
        password : this.state.password
    }))).then((key) => {
      saveTokens(key.secret);
      this.authorized(true);
    });
  }
  doLogout () {
    // remove credentials and refresh model
    clearTokens();
    this.authorized(true);
  }
  onChange(name, event) {
    this.setState({[name]: event.target.value});
  }
	render () {
    var actionForm = <span>
        <a onClick={this.login.bind(this)}>Login</a> or <a onClick={this.signup.bind(this)}>Sign Up</a>
      </span>;
    if (this.state.show) {
      actionForm = <form>
        <input onChange={this.onChange.bind(this, "login")} type="text" name="login"></input>
        <input onChange={this.onChange.bind(this, "password")} type="password" name="password"></input>
        <button onClick={this.doShownForm.bind(this)} type="submit">{this.state.show}</button>
      </form>
    }
		return (
			<div className="Login">
        {this.props.auth.faunadb_secret ?
          <a onClick={this.doLogout}>Logout</a> :
          actionForm
        }
      </div>
		);
	}
}

export default Login;
