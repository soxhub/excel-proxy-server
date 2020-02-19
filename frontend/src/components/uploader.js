import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function Upload({ instanceUrl, instanceToken }) {
	let [state, setState] = useState({
		uploading: false
	});
	const onFormSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("myNarrative", state.uploading);
		formData.append("url", instanceUrl);
		formData.append("token", instanceToken);

		console.log(...formData);

		try {
			fetch("/upload", {
				method: "POST",
				body: formData,
			});
		} catch (error) {
			console.log(error);
		}
		// setState({ uploading: false });
	};

	const onChange = (event)=> {
		console.log(event.target.files[0])
		setState({uploading: event.target.files[0]});
	}

	return (
		<div className="Upload">
			<input type="file" onChange={onChange} encType="multipart/form-data" className="btn btn-primary uploader btn-big-txt" name="myNarrative"></input>
			<button type="submit" onClick={onFormSubmit} className="btn btn-primary btn-center btn-big-txt">Upload</button>
		</div>
	);
}

export default Upload;
