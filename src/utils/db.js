export const toStringKey = (key) => {
    if (key === null || key === undefined) {
        return '';
    }
    return String(key);
};

export const initDB = (dbName, storeName, version = 1) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);
        request.onerror = (event) => {
            reject(`Error open db: ${event.target.error}`);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
    });
};

export const insertData = async (dbName, storeName, key, value) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            const stringKey = toStringKey(key);

            const data = { id: stringKey, value: value };

            const request = store.put(data);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(`Error insert data: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Error in insertData:', error);
        throw error;
    }
};

export const getDataByKey = async (dbName, storeName, key) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            const stringKey = toStringKey(key);

            const request = store.get(stringKey);

            request.onsuccess = (event) => {
                const result = event.target.result;
                resolve(result ? result.value : undefined);
            };

            request.onerror = (event) => {
                reject(`Error get data: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Error in getDataByKey:', error);
        throw error;
    }
};

export const getAllData = async (dbName, storeName) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);

            const request = store.getAll();

            request.onsuccess = (event) => {
                const results = event.target.result;
                const values = results.map(item => item.value);
                resolve(values);
            };

            request.onerror = (event) => {
                reject(`Error get data: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Error in getAllData:', error);
        throw error;
    }
};

export const deleteDataByKey = async (dbName, storeName, key) => {
    try {
        const db = await initDB(dbName, storeName);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            const stringKey = toStringKey(key);

            const request = store.delete(stringKey);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                reject(`Error delete data: ${event.target.error}`);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        console.error('Error in deleteDataByKey:', error);
        throw error;
    }
};