require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'components')));

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
  if ('xlorin'.startsWith(query.toLowerCase())) {
    suggestions.push('Xlorin');
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

let stats = {
  users: 0,
  sales: 0,
  conversions: 0,
  growth: 0
};

app.get('/live_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.json({ result: 'Please enter a longer search term.' });
  }

  stats.users += 1; // increment for each search
  stats.sales += Math.floor(Math.random() * 3); // example: random increment
  stats.conversions = Math.floor((stats.sales / stats.users) * 100);
  stats.growth = Math.floor(Math.random() * 50); // placeholder, can improve later
  
  // Custom hardcoded result for "Xlorin"
  if (query.toLowerCase() === 'xlorin') {
    return res.json({
      result: `
        <div class="result-title">Xlorin</div>
        <div class="result-summary">
          Xlorin is an innovative, emerging search engine developed by young technologist Melody Kelly Nwaogu. Built
           to provide a modern, user-friendly, and visually stunning search experience, Xlorin aims to deliver accurate 
           and relevant results with a fresh perspective.
        </div>
        <img src="/images/x.png" alt="Xlorin Logo" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:4px;">
        <div class="result-founder">Founder: Melody Kelly N.</div>
        <div class="result-co-founder">Co-Founder: Philip</div>
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

app.get('/api/stats', (req, res) => {
  res.json(stats);
});

// Start server

// Unsplash Image Search Endpoint
app.get('/image_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.status(400).json({ result: 'Please enter a longer search term.' });
  }
  const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
  if (!UNSPLASH_KEY) {
    return res.status(500).json({ result: 'Xlorin API key not configured. Please contact the site owner.' });
  }
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=9`;
    const resp = await axios.get(url);
    const images = resp.data.results;
    if (!images.length) {
      return res.status(404).json({ result: 'No images found for your search.' });
    }
    const html = `<div class=\"image-grid\">${images.map(img => `
      <a href=\"${img.links.html}\" target=\"_blank\" class=\"image-item\">
        <img src=\"${img.urls.small}\" alt=\"${img.alt_description || query}\" loading=\"lazy\" />
      </a>
    `).join('')}</div>`;
    res.json({ result: html });
  } catch (e) {
    console.error("Unsplash error:", e.response?.data || e.message);
    res.status(500).json({ result: 'Error fetching images. Please try again later.' });
  }
});

// YouTube Video Search Endpoint
app.get('/video_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.status(400).json({ result: 'Please enter a longer search term.' });
  }
  const YOUTUBE_KEY = process.env.YOUTUBE_KEY;
  if (!YOUTUBE_KEY) {
    return res.status(500).json({ result: 'Xlorin API key not configured. Please contact the site owner.' });
  }
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=9&key=${YOUTUBE_KEY}`;
    const resp = await axios.get(url);
    const videos = resp.data.items;
    if (!videos.length) {
      return res.status(404).json({ result: 'No videos found for your search.' });
    }
    const html = `<div class=\"video-grid\">${videos.map(v => `
      <a href=\"https://www.youtube.com/watch?v=${v.id.videoId}\" target=\"_blank\" class=\"video-item\">
        <img src=\"${v.snippet.thumbnails.medium.url}\" alt=\"${v.snippet.title}\" loading=\"lazy\" />
        <div class=\"video-title\">${v.snippet.title}</div>
      </a>
    `).join('')}</div>`;
    res.json({ result: html });
  } catch (e) {
    res.status(500).json({ result: 'Error fetching videos. Please try again later.' });
  }
});// Food Search Endpoint (Spoonacular)
app.get('/food_search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query || query.length < 2) {
    return res.status(400).json({ result: 'Please enter a longer search term.' });
  }
  const SPOONACULAR_KEY = process.env.SPOONACULAR_KEY;
  if (!SPOONACULAR_KEY) {
    return res.status(500).json({ result: 'Xlorin API key not configured. Please contact the site owner.' });
  }
  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=9&apiKey=${SPOONACULAR_KEY}`;
    const resp = await axios.get(url);
    const recipes = resp.data.results;
    if (!recipes.length) {
      return res.status(404).json({ result: 'No food recipes found for your search.' });
    }
    const html = `<div class="food-grid">${recipes.map(recipe => `
      <a href="https://spoonacular.com/recipes/${recipe.title.replace(/ /g, "-")}-${recipe.id}" target="_blank" class="food-item">
        <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" />
        <div class="food-title">${recipe.title}</div>
      </a>
    `).join('')}</div>`;
    res.json({ result: html });
  } catch (e) {
    res.status(500).json({ result: 'Error fetching food recipes. Please try again later.' });
  }
});

const sendMail = require('./mailer');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/contact', async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) return res.status(400).send('Email and message are required.');
  try {
    await sendMail(email, message);
    res.status(200).send('Message sent successfully!');
  } catch (err) {
    res.status(500).send('Error sending message.');
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));