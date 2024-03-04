const GHPATH = 'https://bcsabaengine.github.io/gitlab-mr-monitor/';

const APP_PREFIX = 'gitlab-mr-monitor_';

const VERSION = 'v1.2.1';

// The files to make available for offline use. make sure to add others to this list
const URLS = [
	`${GHPATH}/`,
	`${GHPATH}/index.html`,
	`${GHPATH}/notification.mp3`,
	`${GHPATH}/favicon.png`,
	`${GHPATH}/gitlab-256.png`,
	`${GHPATH}/gitlab-512.png`,
	`${GHPATH}/manifest.webmanifest`
];

const CACHE_NAME = APP_PREFIX + VERSION;
self.addEventListener('fetch', function (event_) {
	event_.respondWith(
		caches.match(event_.request).then(function (request) {
			if (request) return request;
			return fetch(event_.request);
		})
	);
});

self.addEventListener('install', function (event_) {
	event_.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			return cache.addAll(URLS);
		})
	);
});

self.addEventListener('activate', function (event_) {
	event_.waitUntil(
		caches.keys().then(function (keyList) {
			var cacheWhitelist = keyList.filter(function (key) {
				return key.indexOf(APP_PREFIX);
			});
			cacheWhitelist.push(CACHE_NAME);
			return Promise.all(
				keyList.map(function (key, index) {
					if (!cacheWhitelist.includes(key)) {
						return caches.delete(keyList[index]);
					}
				})
			);
		})
	);
});
