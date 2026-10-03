// style.js
const FAB_STYLE = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '999999',
    backgroundColor: '#404040',
    color: '#ffffff',
    border: '1px solid #7a7a7a',
    padding: '10px 18px',
    borderRadius: '24px',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.85), 0 2px 8px rgba(0, 0, 0, 0.6)',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'monospace',
    userSelect: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
};

const FAB_HOVER_STYLE = {
    backgroundColor: '#585858',
    borderColor: '#7a7a7a',
};

const POPUP_STYLE = {
    position: 'fixed',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: '1280px',
    maxHeight: '560px',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    zIndex: '999999',
    display: 'none',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: '12px',
    boxSizing: 'border-box',
};

const HEADER_TOGGLE_BTN_BASE = {
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease',
};

const HEADER_TOGGLE_BTN_OFF = {
    backgroundColor: '#383838',
    color: '#888888',
    border: '1px solid #4a4a4a',
};

const HEADER_TOGGLE_BTN_ON = {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: '1px solid #14b8a6',
    boxShadow: '0 0 6px rgba(20, 184, 166, 0.4)',
};

const LIST_ROW_STYLE = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    padding: '8px 12px',
    backgroundColor: '#2b2b2b',
    borderRadius: '4px',
    wordBreak: 'break-all',
    gap: '12px',
};

const RES_BTN_STYLE = {
    border: 'none',
    padding: '3px 7px',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    opacity: '0.85',
    transition: 'opacity 0.15s ease, transform 0.1s ease',
    userSelect: 'none',
    color: '#fff',
};

const COPY_BTN_STYLE = {
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'monospace',
};

const RES_PRESETS = [
    { label: '480', bg: '#4a5568' },
    { label: '720', bg: '#2b6cb0' },
    { label: '1080', bg: '#2f855a' },
    { label: '1440', bg: '#d69e2e' },
    { label: '2560', bg: '#dd6b20' },
    { label: '2k', bg: '#e53e3e' },
    { label: '4k', bg: '#805ad5' },
];
