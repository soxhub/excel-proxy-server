import React, { Component } from "react";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';

export default class Upload extends Component {
                 state = {
                   uploading: false
                 };
                 onFormSubmit = e => {
                     console.log(e);
                   const formData = new FormData();
                   console.log(this.state.uploading)
                   formData.append("myImage", this.state.uploading);

                   try {
                     fetch("http://localhost:2000/upload", {
                       method: "POST",
                       body: formData
                     });
                   } catch (error) {
                     console.log(error);
                   }
                   this.setState({ uploading: false });
                 };

                 onChange = e => {
                     console.log(e.target.files.item(0));
                     this.setState({uploading: e.target.files.item(0)});
                 }



                 render() {
                   return (
                     <div className="Upload">
                       <input type="file" onChange={this.onChange} encType="multipart/form-data" className="btn btn-primary uploader btn-big-txt" name="myImage" multiple></input>
                       <button type="submit" onClick={this.onFormSubmit} className="btn btn-primary btn-center btn-big-txt" >Upload</button>
                     </div>
                   );
                 }
               }

