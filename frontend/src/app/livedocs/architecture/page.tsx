'use client'
import React from 'react';

const LiveDocsPage: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <iframe
                src="https://app.superappcatdev.com/workspace/c70bd399-071d-4151-a6b6-8e65e3de7224/KwZ6-vv99GnqARTGJdITi?mode=edgeless&blockIds=2LdcI4teXxfirUPhyFawG"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Live View"
            />
        </div>
    );
};

export default LiveDocsPage;