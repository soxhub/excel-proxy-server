import React, { useState } from 'react'
import { useAlert } from 'react-alert'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

function Upload() {
    const alert = useAlert()

    let [token, setToken] = useState(null)
    let [url, setUrl] = useState(null)
    let [uploading, setUploading] = useState(null)

    const onFormSubmit = e => {
        e.preventDefault()
        if (!validated()) {
            return
        }
        
        const formData = new FormData()
        formData.append('myNarrative', uploading)
        formData.append('url', url)
        formData.append('token', token)

        axios.post('/upload', formData, alert.show('Narrative Being uploaded', {type: 'info'}))
            .then(() => {
                alert.show('Narrative successfully uploaded', {
                    type: 'success',
                })
                setUploading(false)
            })
            .catch(() => {
                alert.show('Error with upload, try again', { type: 'error' })
            })
    }

    const validated = () => {
        let errorMsg = ''
        if (token === '' || url === '') {
            errorMsg = 'Please enter valid credentials' // this case might not be needed anymore
        } else if (uploading && uploading.type !== 'application/zip') {
            errorMsg = 'Please upload a zip file'
        } else if (!uploading) {
            errorMsg = 'No file detected, please try again' //this case might not be needed anymore
        }
        if (errorMsg) {
            alert.show(errorMsg, { type: 'error' })
            return false
        } else {
            return true
        }
    }

    const onChange = event => {
        setUploading(event.target.files[0])
    }

    let disableSubmit = !url || !token || !uploading

    return (
        <form className="panel-body form-theme-2 npb">
            <div className="form-group">
                <input
                    type="url"
                    name="instanceUrl"
                    className="form-control input-sm"
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Instance URL"
                    required
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    name="instanceToken"
                    className="form-control input-sm"
                    onChange={e => setToken(e.target.value)}
                    placeholder="Token"
                    required
                />
            </div>
            <div className="form-group">
                <div className="row">
                    <div className="col-sm">
                        <input
                            style={{ width: 300, marginTop: 20 }}
                            type="file"
                            onChange={onChange}
                            encType="multipart/form-data"
                            className="btn btn-primary btn-md btn-big-txt "
                            name="myNarrative"
                            accept=".zip"
                        ></input>
                    </div>
                    <div className="col-sm">
                        <button
                            style={{ float: 'right', marginTop: 20}}
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
