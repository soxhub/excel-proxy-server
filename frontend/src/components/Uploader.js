import React, { useState } from 'react';
import { useAlert } from 'react-alert';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Upload() {
  const alert = useAlert();

  let [token, setToken] = useState(null);
  let [url, setUrl] = useState(null);
  let [uploading, setUploading] = useState(null);
  let [ fileName, setFileName ] = useState(null);

  const onFormSubmit = e => {
    e.preventDefault()
    if (!validated()) {
      return;
    }

    const formData = new FormData()
    formData.append('myNarrative', uploading);
    formData.append('url', url);
    formData.append('token', token);

    const startAlert = alert.show('Narrative Being uploaded', { type: 'info', timeout: 3000000 });
    axios.post('/api/upload', formData, startAlert)
      .then(() => {
        alert.show('Narrative successfully uploaded', {
          type: 'success',
        });
        alert.remove(startAlert);
        setUploading(false);

        // Redirect to Bull UI
        if (process.env.NODE_ENV === 'development') {
          window.location.href = 'http://localhost:3001/api/queues';
        } else {
          window.location.href = '/api/queues';
        }
      })
      .catch(() => {
        alert.show('Error with upload, try again', { type: 'error' })
        alert.remove(startAlert);
      })
  }

  const validated = () => {
    let errorMsg = ''
    
    if (token === '' || url === '') {
      // this case might not be needed anymore
      errorMsg = 'Please enter valid credentials and client app url.';
    } else if (url && !url.endsWith('.com')) {
      errorMsg = 'Please enter valid client app url.';
    } else if (uploading && uploading.type !== 'application/zip') {
      errorMsg = 'Please upload a zip file.';
    } else if (!uploading) {
      //this case might not be needed anymore
      errorMsg = 'No file detected, please try again.';
    }
    if (errorMsg) {
      alert.show(errorMsg, { type: 'error' });
      return false;
    } else {
      return true;
    }
  }

  const onChange = event => {
    setUploading(event.target.files[0])
    setFileName(event.target.files[0].name);
  }

  const onDropAccepted = (file) => {
    if (file.length > 1) {
      alert.show('You can only upload one zip file', { type: 'error' });
    } else {
      setFileName(null);
      setUploading(file[0]);
    }
  }


  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: 'application/zip',
    onDrop: onDropAccepted
  });
  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      </li>
  ));



  let disableSubmit = !url || !token || !uploading;

  return (
		<form className="panel-body form-theme-2 npb">
			<div className="form-group">
				<label>INSTANCE URL</label>
				<input
					type="url"
					name="instanceUrl"
					className="form-control input-sm"
					onChange={e => setUrl(e.target.value)}
					required
				/>
			</div>
			<div className="form-group">
				<label>TOKEN</label>
				<input
					type="password"
					name="instanceToken"
					className="form-control input-sm"
					onChange={e => setToken(e.target.value)}
					required
				/>
			</div>
			<div className="drop-container">
				<div {...getRootProps({ className: 'dropzone' })}>
          <div className="flex items-center justify-center flex-col w-full h-full">
					<input
						{...getInputProps()}
						onChange={onChange}
						encType="multipart/form-data"
						name="myNarrative"
						accept=".zip"
					/>
					<button
						className="btn btn-primary btn-md browse btn-big-txt"
						type="button"
						onClick={open}
					>
						Browse Files
					</button>
					<p>or drop a file to upload</p>
					<em>(Only .zip files will be accepted)</em>
				</div>
        {fileName}
				{files.length === 1 && <ul>{files}</ul>}
			</div>
      </div>
			<div className="form-group" style={{marginBottom: 40}}>
				<div className="row">
					<div className="col-sm">
						<button
							style={{ float: 'right', marginTop: 20 }}
							type="submit"
							onClick={onFormSubmit}
							disabled={disableSubmit}
							className="btn btn-primary btn-center btn-lg btn-big-txt"
						>
							Upload
						</button>
					</div>
				</div>
			</div>
		</form>
  )
}

export default Upload
