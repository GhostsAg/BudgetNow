let db; 

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

function checkDatabase() {
    // db = event.request.result;
    // access your pending object store
    const transaction = db.transaction(["pending"], "readwrite");
    // get all records from store and set to a variable
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(() => {
            // if successful, open a transaction on your pending db
            // transaction.open(true)
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
            // access your pending object store
            // clear all items in your store
        });
        }
    };
}

request.onerror = function(event) {
    // log error here
    console.log(request.errorCode);
};

function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    // access your pending object store
    // add record to your store with add method.
    // const db = request.result;
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);