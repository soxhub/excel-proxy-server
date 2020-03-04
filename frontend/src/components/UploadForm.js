import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Upload from './Uploader';

function UploadForm() {
    return (
        <div className="container upload-container">
            <div style={{ height: '10%' }} className="flex items-center"></div>
            <section className="panel bg-gray-00">
                <header className="panel-heading text-left mt-4">
                    <h2>Narrative Upload</h2>
                </header>
                <Upload />
            </section>
        </div>
    )
}

export default UploadForm;
