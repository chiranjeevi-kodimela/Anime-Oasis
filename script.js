document.addEventListener('DOMContentLoaded', () => {

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const animeResults = document.getElementById('animeResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('errorMessage');

    const API_BASE_URL = 'https://api.jikan.moe/v4';

    const displayAnime = (animeList) => {
        animeResults.innerHTML = '';
        errorMessage.classList.add('hidden');

        if (animeList.length === 0) {
            resultsTitle.textContent = 'No Results Found';
            return;
        }

        const seenTitles = new Set();

        animeList.forEach(anime => {
            const title = anime.title_english || anime.title;

            if (seenTitles.has(title)) {
                return;  // Skip duplicate titles
            }
            seenTitles.add(title);

            const imageUrl = anime.images.jpg.large_image_url;
            const synopsis = anime.synopsis ? anime.synopsis : 'No Synopsis Available';
            const score = anime.score ? `⭐ ${anime.score}` : 'N/A';
            const episodes = anime.episodes ? `${anime.episodes} episodes` : 'TBA';

            const crunchyrollUrl = `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`;
            const hianimeUrl = `https://www.hianime.to/search?keyword=${encodeURIComponent(title)}`;

            const card = document.createElement('div');
            card.className = 'card shadow-lg';
            card.innerHTML = `
                <img src="${imageUrl}" alt="Poster for ${title}" class="w-full h-64 sm:h-80 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/300x400/1a202c/e2e8f0?text=No+Image';">
                <div class="p-4 card-content">
                    <div>
                        <h3 class="text-md sm:text-lg font-bold text-white mb-2">${title}</h3>
                        <div class="flex justify-between items-center text-sm text-gray-400 mb-2">
                            <span>${score}</span>
                            <span>${episodes}</span>
                        </div>
                        <p class="text-sm text-gray-400 mb-4 synopsis">${synopsis}</p>
                    </div>
                    <div class="mt-auto pt-4 border-t border-gray-700">
                        <p class="text-sm font-semibold mb-2 text-gray-300">Watch Now:</p>
                        <div class="flex flex-col space-y-2">
                            <a href="${crunchyrollUrl}" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">See on Crunchyroll</a>
                            <a href="${hianimeUrl}" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">See on HiAnime</a>
                        </div>
                    </div>
                </div>
            `;
            animeResults.appendChild(card);
        });
    };

    const fetchData = async (endpoint) => {
        loader.classList.remove('hidden');
        animeResults.innerHTML = '';
        errorMessage.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Failed to fetch anime:', error);
            errorMessage.textContent = `Could not fetch data. The API might be down or your request failed. Please try again later.`;
            errorMessage.classList.remove('hidden');
            resultsTitle.textContent = 'An Error Occurred';
            return null;
        } finally {
            loader.classList.add('hidden');
        }
    };

    const searchAnime = async () => {
        const query = searchInput.value.trim();
        if (query) {
            resultsTitle.textContent = `Search Results for "${query}"`;
            const animeList = await fetchData(`anime?q=${encodeURIComponent(query)}&sfw`);
            if (animeList) {
                displayAnime(animeList);
            }
        }
    };

    const getTrendingAnime = async () => {
        resultsTitle.textContent = 'Trending Now';
        const animeList = await fetchData('top/anime?filter=airing&limit=10');
        if (animeList) {
            displayAnime(animeList);
        }
    };

    searchButton.addEventListener('click', searchAnime);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAnime();
        }
    });

    getTrendingAnime();
});
