import React, { Component } from "react";
import logo from "../assets/auditboard-logo.png";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Upload from "./uploader";

export default class Login extends Component {


  render() {
    return (
      <div className="container login-container">
          <div style={{height: '30%'}} className="flex items-center"></div>
         <section className="panel bg-gray-00 shrink">
          <header className="panel-heading text-center">
            <img src={logo} className="logo" alt="Auditboard logo"></img>
          </header>
          <div className="step1">
            <form className="panel-body form-theme-2 npb">
              <div className="form-group">
                <input type="url" className="form-control input-sm"  placeholder="Instance URL" required />
              </div>
              <div className="form-group">
                <input type="password" className="form-control input-sm" placeholder="Token" required />
              </div>
              <Upload/>
            </form>
          </div>
        </section>
      </div>
    );
  }
}
