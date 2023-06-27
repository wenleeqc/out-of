import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, push, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

const appSettings = {
    databaseURL: 'YOUR_FIREBASE_URL'
}

// set up database
const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, 'shoppingList');

const listContainer = document.querySelector('.list-container');
let notAddingNewItem = true; // does input field exist

onValue(shoppingListInDB, (snapshot) => {
    if(snapshot.exists()) {
        const itemsArray = Object.entries(snapshot.val());

        listContainer.innerHTML = "";

        for(let i=0; i < itemsArray.length; i++) {
            renderItem(itemsArray[i]);
        }
    } else {
        listContainer.innerHTML = 'absolutely nothing.'
    }

    // render add-to-list button
    const addBtn = document.createElement('button');
    addBtn.classList.add('add-to-list-btn');
    addBtn.addEventListener('click', addToList);
    listContainer.append(addBtn)
});

function addToList() {
    if(notAddingNewItem) { // if input field exist, don't create another one
        notAddingNewItem = false;
        const last = listContainer.lastElementChild;
        const newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('placeholder', "your heart's desires...");
        newInput.classList.add('input-field');

        newInput.addEventListener('focusout', () => {
            const item = newInput.value;
            if(item) {
                newInput.remove();
                const newLi = document.createElement('li');
                newLi.classList.add('list-item');
                newLi.textContent = item;
                //push(shoppingListInDB, item);
                push(shoppingListInDB, {item: item, state: 'unchecked'});
                notAddingNewItem = true;
            } else {
                newInput.remove();
                notAddingNewItem = true;
            }
        });

        newInput.addEventListener('keyup', (e) => {
            if(e.key === "Enter" || e.keyCode === 13) {
                const item = newInput.value;
                if(item) {
                    newInput.blur();
                }
            }
        });

        listContainer.insertBefore(newInput, last);
        newInput.focus();
    }
}

function renderItem(item) {
    const [itemID, itemData] = item;
    const itemValue = itemData.item;
    const itemState = itemData.state;
    const newItem = document.createElement('li');

    // check off item from list
    newItem.addEventListener('click', () => {
        newItem.classList.toggle('checked');
        const isChecked = newItem.classList.contains('checked');
        let itemState = "";
        if(isChecked) {
            itemState = 'checked';
        } else {
            itemState = 'unchecked';
        }
        const exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)

        const updates = {}
        updates.state = itemState
        update(exactLocationOfItemInDB, updates);
    });

    // delete item from list
    newItem.addEventListener('dblclick', () => {
        const exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        remove(exactLocationOfItemInDB);
    });

    newItem.classList.add('list-item');
    if(itemState === 'checked') {
        newItem.classList.add('checked');
    }
    newItem.textContent = itemValue;
    listContainer.append(newItem);
}