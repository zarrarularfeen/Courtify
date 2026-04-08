const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const url = require('url');

const rootDir = path.join(__dirname, 'postman', 'collections', 'Courtify Sprint 1 Tests');
const outPath = path.join(__dirname, 'Courtify_Sprint_1_Tests_Exported.json');

const collection = {
    info: {
        name: "Courtify Sprint 1 Tests",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
        { key: "base_url", value: "http://localhost:5000", type: "string" }
    ],
    item: []
};

function parseUrl(rawUrl) {
    // Handle {{base_url}}/path?query=x style URLs
    const urlObj = { raw: rawUrl };

    // Split query string
    const [pathPart, queryPart] = rawUrl.split('?');

    // Replace {{variable}} with placeholder, split, then restore
    const normalized = pathPart.replace(/\{\{([^}]+)\}\}/g, '__VAR_$1__');
    const segments = normalized.split('/').filter(s => s.length > 0);

    // FIX: use .+? (lazy) so underscores inside var names are captured correctly
    const restored = segments.map(s => s.replace(/__VAR_(.+?)__/g, '{{$1}}'));

    urlObj.host = [restored[0]];        // e.g. ["{{base_url}}"]
    urlObj.path = restored.slice(1);    // e.g. ["auth", "signup"]

    if (queryPart) {
        urlObj.query = queryPart.split('&').map(pair => {
            const [key, value] = pair.split('=');
            return { key: key || '', value: value || '' };
        });
    }

    return urlObj;
}

// Explicit folder ordering — determines test-run sequence in Postman
const FOLDER_ORDER = [
    'Registration',
    'Email Verification',
    'Login',
    'Route Protection',
    'Arena Listing',
    'Search & Filter',
    'Owner Arena Registration',
    'Database Integrity'
];

function sortKey(name) {
    const idx = FOLDER_ORDER.indexOf(name);
    return idx === -1 ? 999 : idx;
}

function processDir(dirPath, parentArr, isRoot = false) {
    let items = fs.readdirSync(dirPath).sort();
    // At the root level, sort folders by the defined FOLDER_ORDER
    if (isRoot) {
        items = items.sort((a, b) => sortKey(a) - sortKey(b));
    }
    for (const item of items) {
        if (item === '.resources') continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            const folder = { name: item, item: [] };
            parentArr.push(folder);
            processDir(fullPath, folder.item);
        } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
            try {
                const doc = yaml.load(fs.readFileSync(fullPath, 'utf8'));
                if (doc.$kind === 'http-request') {
                    // Build URL object – include queryParams from YAML if present
                    const urlObj = parseUrl(doc.url || 'http://localhost:5000');
                    if (doc.queryParams && doc.queryParams.length > 0) {
                        const qArr = doc.queryParams.map(qp => ({ key: qp.key, value: qp.value || '' }));
                        // Append to raw URL
                        const qs = qArr.map(q => `${q.key}=${q.value}`).join('&');
                        urlObj.raw = urlObj.raw + (urlObj.raw.includes('?') ? '&' : '?') + qs;
                        urlObj.query = (urlObj.query || []).concat(qArr);
                    }

                    const reqObj = {
                        name: doc.name || item.replace('.request.yaml', ''),
                        request: {
                            method: doc.method || 'GET',
                            header: [],
                            url: urlObj
                        },
                        event: []
                    };

                    if (doc.headers) {
                        reqObj.request.header = doc.headers.map(h => ({
                            key: h.key, value: h.value
                        }));
                    }

                    if (doc.body) {
                        // YAML uses body.content (not body.raw)
                        const bodyContent = doc.body.content || doc.body.raw || '';
                        reqObj.request.body = {
                            mode: "raw",
                            raw: bodyContent,
                            options: { raw: { language: "json" } }
                        };
                        // Ensure Content-Type header is present for JSON bodies
                        const hasContentType = reqObj.request.header.some(h => h.key.toLowerCase() === 'content-type');
                        if (!hasContentType && (doc.body.type === 'json' || bodyContent.trim().startsWith('{'))) {
                            reqObj.request.header.push({ key: 'Content-Type', value: 'application/json' });
                        }
                    }

                    if (doc.scripts) {
                        for (const sc of doc.scripts) {
                            if (sc.type === 'afterResponse') {
                                reqObj.event.push({
                                    listen: "test",
                                    script: {
                                        type: "text/javascript",
                                        exec: sc.code.split('\n')
                                    }
                                });
                            } else if (sc.type === 'beforeRequest') {
                                reqObj.event.push({
                                    listen: "prerequest",
                                    script: {
                                        type: "text/javascript",
                                        exec: sc.code.split('\n')
                                    }
                                });
                            }
                        }
                    }
                    parentArr.push(reqObj);
                }
            } catch (e) {
                console.error('Error parsing', fullPath, e.message);
            }
        }
    }
}

try {
    processDir(rootDir, collection.item, true);
    fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
    console.log("✅ Successfully exported to", outPath);
    // Count requests and test scripts
    let reqCount = 0, testCount = 0;
    function countItems(items) {
        for (const i of items) {
            if (i.item) countItems(i.item);
            else { reqCount++; if (i.event && i.event.length) testCount++; }
        }
    }
    countItems(collection.item);
    console.log(`📊 ${reqCount} requests, ${testCount} with test scripts`);
} catch (e) {
    console.error("Failed to generate collection:", e);
}
