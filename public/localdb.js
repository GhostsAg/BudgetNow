let db; 

const request = indexedDB.open("budget", 2);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore("pending-transaction", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

function checkDatabase() {
    // access your pending-transaction object store
    const transaction = db.transaction(["pending-transaction"], "readwrite");
    // get all records from store and set to a variable
    const store = transaction.objectStore("pending-transaction");
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
                // if successful, open a transaction on your pending-transaction db
                const transaction = db.transaction(["pending-transaction"], "readwrite");
                const store = transaction.objectStore("pending-transaction");
                store.clear();
                // access your pending-transaction object store
                // clear all items in your store
            });
        }
    };
}

request.onerror = function(event) {
    // log error here
    console.log("error:", request.errorCode);
};

function saveRecord(record) {
    // create a transaction on the pending-transaction db with readwrite access
    // access your pending-transaction object store
    // add record to your store with add method.
    // const db = request.result;
    const transaction = db.transaction(["pending-transaction"], "readwrite");
    const pending = transaction.objectStore("pending-transaction");
    pending.add(record);
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);