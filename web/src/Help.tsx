const keyComboStyle = {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#747bff',
  backgroundColor: '#2d2d2d',
  padding: '0.2em 0.5em',
  borderRadius: 5,
}

export function Help() {
  
  return (
    <>
      <div>
        <h1
          style={{
            margin: '.5rem',
          }}
        >
          Keybinding Help
        </h1>
      </div>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content max-content',
            gap: 20,
            margin: '.5em',
          }}
        >
          <div>
            <label>Next Result:</label>
          </div>
          <div>
            <span style={keyComboStyle}>k</span>
          </div>
          <div>
            <label>Previous Result:</label>
          </div>
          <div>
            <span style={keyComboStyle}>j</span>
          </div>
          <div>
            <label>Focus on current search bar:</label>
          </div>
          <div>
            <span style={keyComboStyle}>/</span>
          </div>
        </div>
      </div>
    </>
  )
}
