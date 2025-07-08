require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const SERPAPI_KEY = process.env.SERPAPI_KEY;

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
    // Avoid duplicate "Anchor"
    suggestions = [...new Set([...suggestions, ...wikiSuggestions])].slice(0, 7);
    res.json({ suggestions });
  } catch (e) {
    res.json({ suggestions });
  }
});
function highlight(text, query) {
  const re = new RegExp(query, 'gi');
  return text.replace(re, (match) => `<mark>${match}</mark>`);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/live_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json({ result: 'Please enter a longer search term.' });
  }

  // Custom result for "anchor"
  if (query.toLowerCase() === 'anchor') {
    return res.json({
      result: `<strong>Anchor</strong><br>
        Anchor is an upgrowing search engine developed by Melody Kelly N., a young teenager passionate about technology and innovation. Anchor aims to provide a modern, user-friendly, and visually stunning search experience for everyone.<br>
        <img src=\"https://i.postimg.cc/XJtfFNmb/anchor.png\" alt=\"Anchor Logo\" style=\"max-width:200px;max-height:200px;border-radius:8px;margin-top:4px;\">`
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
          if (summaryRes.data.thumbnail && summaryRes.data.thumbnail.source) {
            imgHtml = `<br><img src="${summaryRes.data.thumbnail.source}" alt="${item.title}" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:4px;">`;
          }
        } catch (e) {
          summary = '';
        }
        const titleHl = highlight(item.title, query);
        const summaryHl = highlight(summary, query);
        output.push(`<strong>${titleHl}</strong><br>${summaryHl}${imgHtml}`);
      }
      return res.json({ result: output.join('<hr>') });
    }

    // If no Wikipedia results, try SerpAPI
    if (SERPAPI_KEY) {
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`;
      const serpRes = await axios.get(serpUrl);
      const serpResults = serpRes.data.organic_results || [];
      if (serpResults.length) {
        let output = serpResults.slice(0, 3).map(item =>
          `<strong>${item.title}</strong><br>${item.snippet || ''}<br><a href="${item.link}" target="_blank">${item.link}</a>`
        );
        return res.json({ result: output.join('<hr>') });
      }
    }
    return res.json({ result: 'No results found. Please try a different or broader phrase.' });
  } catch (e) {
    res.json({ result: 'An unexpected error occurred.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));