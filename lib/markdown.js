// Tiny, dependency-free Markdown -> HTML for the scraped content (headings,
// paragraphs, lists, blockquotes, and bare-URL autolinking). Not a full parser
// — just enough for this site's prose.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function linkify(s) {
  // full URLs
  s = s.replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  // bare domains like foo.vercel.app or example.com/path (not already linked)
  s = s.replace(/(^|[\s(])((?:[a-z0-9-]+\.)+(?:app|com|org|net|io)(?:\/[^\s<]*)?)/gi, (m, pre, dom) => {
    if (/https?:\/\//.test(pre)) return m;
    return `${pre}<a href="https://${dom}" target="_blank" rel="noopener">${dom}</a>`;
  });
  // .is only when it carries a path, so "pol.is/report/x" links but a bare
  // mention of "Pol.is" in prose stays plain text — which is how the original
  // Format pages had it.
  s = s.replace(/(^|[\s(])((?:[a-z0-9-]+\.)+is\/[^\s<]*)/gi, (m, pre, dom) => {
    if (/https?:\/\//.test(pre)) return m;
    return `${pre}<a href="https://${dom}" target="_blank" rel="noopener">${dom}</a>`;
  });
  return s;
}

const inline = (s) => linkify(escapeHtml(s.trim()));

export function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let para = [];
  let list = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();

    if (t === '') {
      flushPara();
      flushList();
      continue;
    }

    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    if (t.startsWith('> ')) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(t.slice(2))}</blockquote>`);
      continue;
    }

    if (t.startsWith('- ')) {
      flushPara();
      list.push(t.slice(2));
      continue;
    }

    flushList();
    para.push(t);
  }
  flushPara();
  flushList();
  return out.join('\n');
}
