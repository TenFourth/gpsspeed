// キャッシュ更新のために、ファイルの変更があったら変更する
const CACHE_NAME = 'gpsspeed-pwa-v1.0.12';

const CACHE_FILES = [
    'acceleration.js',
    'car-adove.js',
    'graph.js',
    'headingtape.css',
    'headingtape.js',
    'index.html',
    'main.css',
    'speedmeter.css',
    'speedmeter.js',
    'img/car-adove.png',
    'img/climbing.png',
    'img/elevation.svg',
    'img/icon-192.png',
    'img/icon-512.png'
];

// Service Workerをインストール
    self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES)));
    });

    // 古いキャッシュを削除
    self.addEventListener('activate', event => {
        event.waitUntil(
            caches.keys().then(keys => {
                return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
            })
        );
    });

    // ページやファイルへのアクセス
    self.addEventListener('fetch', event => {
        event.respondWith(caches.match(event.request).then(response => {
            // キャッシュにあればキャッシュを返す
            if (response) {
                return response;
            }

            // なければネットワークから取得
            return fetch(event.request);
        }));
    });

