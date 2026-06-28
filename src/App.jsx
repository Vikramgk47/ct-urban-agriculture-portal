import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const CONNECTICUT_CENTER = [41.6032, -72.7554];
const CATEGORY_COLORS = {
  'Community Garden': '#2f7d4f',
  'Community Farm': '#a35f1d',
};

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function validUrl(value) {
  const text = String(value || '').trim();
  return text && text !== 'Not Found';
}

function fitBoundsFromSites(sites) {
  if (!sites.length) return null;
  const lats = sites.map((site) => Number(site.lat));
  const lngs = sites.map((site) => Number(site.lng));
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

function MapBounds({ sites }) {
  const map = useMap();

  useEffect(() => {
    const bounds = fitBoundsFromSites(sites);
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
  }, [map, sites]);

  return null;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SitePopup({ site }) {
  const directions = site.directions || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address || site.name)}`;

  return (
    <article className="popup-card">
      {validUrl(site.image) && (
        <img className="popup-image" src={site.image} alt={site.name} loading="lazy" />
      )}
      <h2>{site.name}</h2>
      <p className="popup-category">{site.category}</p>
      <dl>
        <div>
          <dt>Address</dt>
          <dd>{site.address || 'Not Found'}</dd>
        </div>
        <div>
          <dt>City</dt>
          <dd>{site.city || 'Not Found'}</dd>
        </div>
        <div>
          <dt>Operator</dt>
          <dd>{site.operator || 'Not Found'}</dd>
        </div>
      </dl>
      <p className="popup-description">{site.description || 'Not Found'}</p>
      <div className="popup-links">
        {validUrl(site.website) && <a href={site.website} target="_blank" rel="noreferrer">Website</a>}
        {validUrl(site.source) && <a href={site.source} target="_blank" rel="noreferrer">Source</a>}
        <a href={directions} target="_blank" rel="noreferrer">Get Directions</a>
      </div>
    </article>
  );
}

function Sidebar({ search, setSearch, city, setCity, category, setCategory, cities, categories, resultCount }) {
  return (
    <aside className="sidebar" aria-label="Garden search and filters">
      <div className="brand-block">
        <p className="eyebrow">Interactive map</p>
        <h1>Connecticut Urban Agriculture Portal</h1>
      </div>

      <div className="filter-panel">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Garden, city, address, operator"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label htmlFor="city">City</label>
        <select id="city" value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {cities.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <div className="result-count" aria-live="polite">
          {resultCount} mapped {resultCount === 1 ? 'site' : 'sites'} shown
        </div>
      </div>
    </aside>
  );
}

function SiteList({ sites }) {
  return (
    <section className="site-list" aria-label="Filtered garden list">
      {sites.slice(0, 80).map((site) => (
        <div className="site-row" key={site.id}>
          <div>
            <strong>{site.name}</strong>
            <span>{site.city} · {site.category}</span>
          </div>
          <a href={site.directions} target="_blank" rel="noreferrer" aria-label={`Directions to ${site.name}`}>Directions</a>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const [sites, setSites] = useState([]);
  const [status, setStatus] = useState('Loading mapped sites...');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetch('./data/sites.json')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load site data');
        return response.json();
      })
      .then((rows) => {
        const mappedSites = rows
          .filter((site) => Number.isFinite(Number(site.lat)) && Number.isFinite(Number(site.lng)))
          .map((site, index) => ({
            ...site,
            id: `site-${index}-${site.name}`,
            lat: Number(site.lat),
            lng: Number(site.lng),
          }));
        setSites(mappedSites);
        setStatus('');
      })
      .catch((error) => setStatus(error.message));
  }, []);

  const cities = useMemo(() => [...new Set(sites.map((site) => site.city).filter(Boolean))].sort(), [sites]);
  const categories = useMemo(() => [...new Set(sites.map((site) => site.category).filter(Boolean))].sort(), [sites]);

  const filteredSites = useMemo(() => {
    const query = normalize(search);
    return sites.filter((site) => {
      const text = normalize([site.name, site.city, site.address, site.operator].join(' '));
      const matchesSearch = !query || text.includes(query);
      const matchesCity = !city || site.city === city;
      const matchesCategory = !category || site.category === category;
      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [sites, search, city, category]);

  const totalMapped = sites.length;
  const cityCount = cities.length;
  const communityGardenCount = sites.filter((site) => site.category === 'Community Garden').length;
  const communityFarmCount = sites.filter((site) => site.category === 'Community Farm').length;

  return (
    <main className="app-shell">
      <Sidebar
        search={search}
        setSearch={setSearch}
        city={city}
        setCity={setCity}
        category={category}
        setCategory={setCategory}
        cities={cities}
        categories={categories}
        resultCount={filteredSites.length}
      />

      <section className="content-area">
        <div className="dashboard" aria-label="Map summary">
          <StatCard label="Total mapped sites" value={totalMapped} />
          <StatCard label="Cities" value={cityCount} />
          <StatCard label="Community gardens" value={communityGardenCount} />
          <StatCard label="Community farms" value={communityFarmCount} />
        </div>

        <div className="map-panel">
          {status ? (
            <div className="status-message">{status}</div>
          ) : (
            <MapContainer center={CONNECTICUT_CENTER} zoom={9} scrollWheelZoom className="map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapBounds sites={filteredSites.length ? filteredSites : sites} />
              {filteredSites.map((site) => (
                <CircleMarker
                  key={site.id}
                  center={[site.lat, site.lng]}
                  radius={8}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: CATEGORY_COLORS[site.category] || '#3b6d8c',
                    fillOpacity: 0.94,
                  }}
                >
                  <Popup minWidth={260} maxWidth={340}>
                    <SitePopup site={site} />
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>

        <SiteList sites={filteredSites} />
      </section>
    </main>
  );
}
