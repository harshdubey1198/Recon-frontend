import React from "react";

const ReconLoader = () => {
  return (
    <div className="recon-loader-overlay">
      <div className="recon-bg-grid"></div>
      <div className="recon-glow-orb"></div>
      
      <div className="recon-loader-container">
        <div className="recon-particles">
          <div className="recon-particle"></div>
          <div className="recon-particle"></div>
          <div className="recon-particle"></div>
          <div className="recon-particle"></div>
        </div>

        <div className="recon-logo-section">
          <div className="recon-logo-wrapper">
            <div className="recon-orbital-ring recon-ring-3"></div>
            <div className="recon-orbital-ring recon-ring-2"></div>
            <div className="recon-orbital-ring recon-ring-1"></div>
            <div className="recon-scan-line"></div>
            <div className="recon-logo">
              <span className="recon-logo-text">R</span>
            </div>
          </div>
          
          <span className="recon-brand-text">Recon</span>
        </div>
        
        <div className="recon-progress-bar-container">
          <div className="recon-progress-bar"></div>
        </div>
        
        <div className="recon-loading-text">Loading</div>
      </div>
    </div>
  );
};

export default ReconLoader;