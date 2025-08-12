(function () {
  const get = s => document.querySelector(s);
  const out = get('.try-now-textarea');
  const btn = get('.try-now-button');

  function val(sel){
    const el = get(sel);
    if (!el) return '';
    return el.type === 'checkbox' ? el.checked : (el.value || '').trim();
  }

  async function run() {
    out.value = 'Generating…';
    try {
      const payload = {
        name: val('.student-first-name'),
        level: val('.try-now-select'),
        strengths: [val('.try-now-select1'), val('.try-now-select2')].filter(Boolean),
        weaknesses: [val('.try-now-select3'), val('.try-now-select4')].filter(Boolean),
        advance: val('.try-now-checkbox')
      };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      out.value = data.text || 'No comment returned';
    } catch (e) {
      out.value = 'Error: ' + (e.message || e);
    }
  }

  if (btn) btn.addEventListener('click', e => { e.preventDefault(); run(); });
})();