import React from 'react';

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90%',
        overflowY: 'auto', padding: '20px', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '10px', right: '10px', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer'
        }}>×</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;