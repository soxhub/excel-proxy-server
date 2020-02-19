import React, { useState } from "react";
import logo from "../assets/auditboard-logo.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import Upload from "./uploader";

function UploadForm ( ){
  let [state, setState] = useState({
    instanceUrl: '',
    instanceToken: ''
  });

  const handleChange = e => {
    
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }
  
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
                <input type="url" name="instanceUrl" className="form-control input-sm" onChange={handleChange} placeholder="Instance URL" required />
              </div>
              <div className="form-group">
                <input type="password" name="instanceToken" className="form-control input-sm" onChange={handleChange} placeholder="Token" required />
              </div>
              <Upload currentState={state}/>
            </form>
          </div>
        </section>
      </div>
    );
  }

export default UploadForm;


