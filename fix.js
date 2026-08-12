const fs = require('fs');
let c = fs.readFileSync('src/app/logic.js', 'utf8');
c = c.replace(
  /siteVenue: \(\) => this\.toast\(v\.site\),\s*back: \(\) => this\.go\('discover'\),/,
  `siteVenue: () => this.toast(v.site),\n      bizLivePreview: st.bizLivePreview,\n      back: () => { if (st.bizLivePreview) { this.setState({ bizLivePreview: false, isVenue: false }); } else { this.go('discover'); } },`
);
fs.writeFileSync('src/app/logic.js', c);
