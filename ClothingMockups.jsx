import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stage } from '../mockup/Stage.js';
import { GARMENTS, MATERIALS, COLORS, PLACEMENTS } from '../mockup/garments.js';

const FONTS = [
  { label: 'Bold sans', css: '800 200px Inter, "Helvetica Neue", Arial, sans-serif' },
  { label: 'Serif', css: '700 200px Georgia, "Times New Roman", serif' },
  { label: 'Condensed', css: '700 200px "Arial Narrow", Impact, sans-serif' },
  { label: 'Mono', css: '700 200px "Courier New", monospace' },
];

function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 > 0.55;
}

function textToCanvas(text, font, color) {
  const lines = text.split('\n').filter(Boolean);
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const lh = 220;
  const w = Math.max(...lines.map((l) => g.measureText(l).width), 10);
  c.width = Math.ceil(w + 40);
  c.height = lh * lines.length + 40;
  g.font = font;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, c.width / 2, 20 + lh * i + lh / 2));
  return c;
}

export default function ClothingMockups() {
  const mountRef = useRef(null);
  const stageRef = useRef(null);

  const [garment, setGarment] = useState('tshirt');
  const [color, setColor] = useState('#f5f5f2');
  const [material, setMaterial] = useState('cotton');
  const [mode, setMode] = useState('none'); // none | logo | text
  const [logo, setLogo] = useState(null);
  const [text, setText] = useState('PDR TEAM');
  const [textColor, setTextColor] = useState('#111214');
  const [font, setFont] = useState(0);
  const [placement, setPlacement] = useState('center');
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [spin, setSpin] = useState(true);

  useEffect(() => {
    const stage = new Stage(mountRef.current);
    stageRef.current = stage;
    return () => stage.dispose();
  }, []);

  useEffect(() => stageRef.current?.setAutoRotate(spin), [spin]);

  useEffect(() => {
    let design = null;
    if (mode === 'logo') design = logo;
    if (mode === 'text' && text.trim()) design = textToCanvas(text, FONTS[font].css, textColor);
    stageRef.current?.set({ garment, color, material, design, placement, scale, offsetX, offsetY });
  }, [garment, color, material, mode, logo, text, textColor, font, placement, scale, offsetX, offsetY]);

  // keep text readable: flip text colour when the garment colour flips light/dark
  const pickColor = (c) => {
    setColor(c);
    if (isLight(c) === isLight(textColor)) setTextColor(isLight(c) ? '#111214' : '#f5f5f2');
  };

  const pickGarment = (g) => {
    setGarment(g);
    setMaterial(GARMENTS[g].defaultMaterial);
  };

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setLogo(img); setMode('logo'); };
    img.src = url;
  };

  const pickPlacement = (p) => {
    setPlacement(p);
    setScale(1); setOffsetX(0); setOffsetY(0);
    stageRef.current?.showSide(PLACEMENTS[p].side);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = stageRef.current.exportPNG();
    a.download = `mockup-${garment}.png`;
    a.click();
  };

  return (
    <div className="mockup">
      <div className="mockup-head">
        <p className="eyebrow"><Link to="/projects">Projects</Link> / Clothing Mockups</p>
        <h1>Clothing Mockups</h1>
        <p className="lead small">Pick a garment, set color and material, add your logo or text. Drag to rotate.</p>
      </div>

      <div className="mockup-grid">
        <div className="viewer">
          <div className="viewer-canvas" ref={mountRef} />
          <div className="viewer-bar">
            <button className={`pill ${spin ? 'on' : ''}`} onClick={() => setSpin(!spin)}>
              {spin ? 'Pause spin' : 'Spin'}
            </button>
            <button className="pill" onClick={() => { setSpin(false); stageRef.current.showSide('front'); }}>Front</button>
            <button className="pill" onClick={() => { setSpin(false); stageRef.current.showSide('back'); }}>Back</button>
            <button className="pill" onClick={download}>Download PNG</button>
          </div>
        </div>

        <aside className="panel">
          <section>
            <h4>1 · Garment</h4>
            <div className="seg">
              {Object.entries(GARMENTS).map(([k, g]) => (
                <button key={k} className={garment === k ? 'on' : ''} onClick={() => pickGarment(k)}>{g.label}</button>
              ))}
            </div>
          </section>

          <section>
            <h4>2 · Color</h4>
            <div className="swatches">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`swatch ${color === c ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => pickColor(c)}
                  aria-label={c}
                />
              ))}
              <label className="swatch custom" title="Custom color">
                <input type="color" value={color} onChange={(e) => pickColor(e.target.value)} />
                +
              </label>
            </div>
          </section>

          <section>
            <h4>3 · Material</h4>
            <div className="seg wrap">
              {Object.entries(MATERIALS).map(([k, m]) => (
                <button key={k} className={material === k ? 'on' : ''} onClick={() => setMaterial(k)}>{m.label}</button>
              ))}
            </div>
          </section>

          <section>
            <h4>4 · Logo or text</h4>
            <div className="seg">
              <button className={mode === 'none' ? 'on' : ''} onClick={() => setMode('none')}>None</button>
              <button className={mode === 'logo' ? 'on' : ''} onClick={() => setMode('logo')}>Logo</button>
              <button className={mode === 'text' ? 'on' : ''} onClick={() => setMode('text')}>Text</button>
            </div>

            {mode === 'logo' && (
              <label className="upload">
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={onUpload} />
                {logo ? 'Replace logo' : 'Upload logo (PNG with transparent background works best)'}
              </label>
            )}

            {mode === 'text' && (
              <div className="text-ctrl">
                <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your text" />
                <div className="row">
                  <select value={font} onChange={(e) => setFont(Number(e.target.value))}>
                    {FONTS.map((f, i) => <option key={f.label} value={i}>{f.label}</option>)}
                  </select>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                </div>
              </div>
            )}

            {mode !== 'none' && (
              <>
                <div className="seg wrap" style={{ marginTop: 10 }}>
                  {Object.entries(PLACEMENTS).map(([k, p]) => (
                    <button key={k} className={placement === k ? 'on' : ''} onClick={() => pickPlacement(k)}>{p.label}</button>
                  ))}
                </div>
                <label className="slider">Size
                  <input type="range" min="0.3" max="2" step="0.01" value={scale} onChange={(e) => setScale(+e.target.value)} />
                </label>
                <label className="slider">Left / right
                  <input type="range" min="-0.6" max="0.6" step="0.01" value={offsetX} onChange={(e) => setOffsetX(+e.target.value)} />
                </label>
                <label className="slider">Up / down
                  <input type="range" min="-0.9" max="0.6" step="0.01" value={offsetY} onChange={(e) => setOffsetY(+e.target.value)} />
                </label>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
