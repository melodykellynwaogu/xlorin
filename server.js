require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const SERPAPI_KEY = process.env.SERPAPI_KEY;
//

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Highlight function
function highlight(text, query) {
  const re = new RegExp(query, 'gi');
  return text.replace(re, (match) => `<mark>${match}</mark>`);
}

// Suggestion endpoint
app.get('/suggest', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }

  let suggestions = [];
  if ('anchor'.startsWith(query.toLowerCase())) {
    suggestions.push('Anchor');
  }

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=prefixsearch&pssearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const wikiRes = await axios.get(url);
    const wikiSuggestions = wikiRes.data.query.prefixsearch.map(item => item.title);
    suggestions = [...new Set([...suggestions, ...wikiSuggestions])].slice(0, 7);
    res.json({ suggestions });
  } catch (e) {
    res.json({ suggestions });
  }
});

// Live search endpoint
app.get('/live_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json({ result: 'Please enter a longer search term.' });
  }

  // Custom hardcoded result for "anchor"
  if (query.toLowerCase() === 'anchor') {
    return res.json({
      result: `
        <div class="result-title">Anchor</div>
        <div class="result-summary">
          Anchor is an upgrowing search engine developed by Melody Kelly N., a young teenager passionate about technology and innovation.
          Anchor aims to provide a modern, user-friendly, and visually stunning search experience for everyone.
        </div>
        <img src="https://i.postimg.cc/XJtfFNmb/anchor.png" alt="Anchor Logo" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:4px;">
      `
    });
  }

  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const searchRes = await axios.get(searchUrl);
    const results = searchRes.data.query.search.slice(0, 3);

    if (results.length) {
      let output = [];

      for (const item of results) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`;
        let summary = '';
        let imgHtml = '';

        try {
          const summaryRes = await axios.get(summaryUrl);
          summary = summaryRes.data.extract;

          if (summaryRes.data.thumbnail?.source) {
            imgHtml = `<br><img src="${summaryRes.data.thumbnail.source}" alt="${item.title}" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:4px;">`;
          }
        } catch (e) {
          summary = '';
        }

        const titleHl = highlight(item.title, query);
        const summaryHl = highlight(summary, query);

        output.push(`
          <div class="result-title">${titleHl}</div>
          <div class="result-summary">${summaryHl}</div>
          ${imgHtml}
        `);
      }

      return res.json({ result: output.join('<hr>') });
    }

    // Fallback: SerpAPI (optional)
    if (SERPAPI_KEY) {
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
      const serpRes = await axios.get(serpUrl);
      const serpResults = serpRes.data.organic_results || [];

      if (serpResults.length) {
        const output = serpResults.slice(0, 3).map(item => `
          <div class="result-title">${item.title}</div>
          <div class="result-summary">${item.snippet || ''}</div>
          <a href="${item.link}" target="_blank">${item.link}</a>
        `);

        return res.json({ result: output.join('<hr>') });
      }
    }

    res.json({ result: 'No results found. Please try a different or broader phrase.' });
  } catch (e) {
    res.json({ result: 'An unexpected error occurred.' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
