class TableData {
    #headers = [];
    #body = [];

    constructor(data) {
        this.updateTableData(data);
    }

    updateTableData(data) {
        this.data = data || this.data;
        this.updateHeaders(this.data.headers);
        this.updateBody(this.data.items);

        return this.generateTable();
    }

    updateHeaders(headers) {
        this.#headers = Object.keys(headers).map(key => {
            if (FILTER_DATA.isInFolder && (key === 'folder')) {
                return null;
            }

            return headers[key];
        }).filter(value => value !== null);
    }

    updateBody(body) {
        this.#body = body.sort((a, b) => {
            const isInverse = FILTER_DATA[SORT_TAG].at(-1) === '_';
            const key = isInverse ? FILTER_DATA[SORT_TAG].substring(0, FILTER_DATA[SORT_TAG].length - 1) : FILTER_DATA[SORT_TAG];
            return SORT_DATA[key].functionCompare(a, b, isInverse);
        }).map(item => {
            let localItem = {...item};

            if (FILTER_DATA.isInFolder) {
                localItem.name = localItem.folder;
                localItem.folder = null;
                localItem.scan = null;
            }

            if (FILTER_DATA[MOL_TAG] !== localItem.mol && FILTER_DATA[MOL_TAG] !== 'all' ||
                FILTER_DATA[ADDRESS_TAG] !== localItem.address && FILTER_DATA[ADDRESS_TAG] !== 'all') {
                return null;
            }

            if (![localItem.name, localItem.inv].some(el => el.includes(FILTER_DATA.search))) {
                return null;
            }

            localItem.mol = MOL_DATA[localItem.mol].name;
            localItem.address = ADDRESS_DATA[localItem.address].name;

            return Object.values(localItem).filter(value => value !== null);
        }).filter(value => value !== null)
    }

    generateTable() {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // let folderColumnIndex = -1;

        const headersRow = document.createElement('tr');
        this.#headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;

            // if (header === this.data.headers.folder) {
            //     th.dataset.isfolder = 'true';
            //     folderColumnIndex = index;
            // }

            headersRow.appendChild(th);
        });
        thead.appendChild(headersRow);

        this.#body.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach((cell, index) => {
                const td = document.createElement('td');
                td.textContent = cell;

                // if (folderColumnIndex === index) {
                //     td.dataset.isfolder = 'true';
                // }

                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        return table.innerHTML;
    }
}

let FILTER_DATA = {
    isInFolder: false,
    search: '',
}

const MOL_TAG = 'mol';
const MOL_DATA = {
    "1": {
        name: "А.В. Заглада",
        active: false,
    },
    "2": {
        name: "ФИО2",
        active: false,
    },
    "3": {
        name: "ФИО3",
        active: false,
    },
    "all": {
        name: "Все",
        active: true,
    },
}

const ADDRESS_TAG = 'address'
const ADDRESS_DATA = {
    "1": {
        name: "Лялин, 6",
        active: false,
    },
    "2": {
        name: "Огородная слобода",
        active: false,
    },
    "3": {
        name: "Ленинский проспект",
        active: false,
    },
    "all": {
        name: "Все",
        active: true,
    },
}

const SORT_TAG = 'sort'
const SORT_DATA = {
    "1": {
        name: "по названию",
        active: true,
        functionCompare: (a, b, isInverse) => {
            console.log(a.name.localeCompare(b.name))
            return (isInverse ? -1 : 1) * a.name.localeCompare(b.name);
        }
    },
    "2": {
        name: "по количеству отсканированного",
        active: false,
        functionCompare: (a, b, isInverse) => {
            return (isInverse ? -1 : 1) * a.name.localeCompare(b.name);
        }
    },
    "3": {
        name: "по сумме",
        active: false,
        functionCompare: (a, b, isInverse) => {
            return (isInverse ? -1 : 1) * a.sum - b.sum;
        }
    },
}

const TABLE_JSON = {
    headers: {
        name: "Название",
        inv: "Инвентарный номер",
        mol: "М.О.Л.",
        sum: "Сумма",
        address: "Местоположение",
        scan: "Отсканировано",
        folder: "Папка",
    },
    items: [{
        name: "Стол",
        inv: "123456789",
        mol: "1",
        sum: "123",
        address: "1",
        scan: "да",
        folder: "-"
    }, {
        name: "Кресло",
        inv: "123456789",
        mol: "2",
        sum: "123345",
        address: "2",
        scan: "нет",
        folder: "-"
    }, {
        name: "Стол",
        inv: "123456789",
        mol: "3",
        sum: "123345",
        address: "2",
        scan: "да",
        folder: "-"
    }, {
        name: "Ложки",
        inv: "123456789",
        mol: "1",
        sum: "123345",
        address: "3",
        scan: "да",
        folder: "-"
    }],
}

/**
 * Генерация фильтров таблицы под поиском
 * @param molListElement - элемент, в который будут добавляться кнопки
 * @param JSON - данные для кнопок фильтра
 * @param tag - тег для dataset параметра
 */
function loadTableFilter(molListElement, JSON, tag) {
    const filterTableElementsList = []

    Object.keys(JSON).forEach((key, index) => {
        const filterTableElement = document.createElement('button');
        filterTableElement.textContent = JSON[key].name;
        filterTableElement.dataset[tag] = key;

        if (JSON[key].active) {
            filterTableElement.classList.add('active');
            FILTER_DATA[tag] = key;
        }

        filterTableElement.addEventListener('click', () => {
            for (const button of filterTableElementsList) {
                button.classList.remove('active');
            }

            Object.keys(JSON).forEach(key => {
                JSON[key].active = false;
            });

            filterTableElement.classList.add('active');
            if (FILTER_DATA[tag] === key) {
                FILTER_DATA[tag] = FILTER_DATA[tag] + "_";
            } else {
                FILTER_DATA[tag] = key;
            }
            JSON[key].active = true;

            new TableDataListener().setFilter();
        });

        filterTableElementsList.push(filterTableElement);
        molListElement.appendChild(filterTableElement);

        if (index === Object.keys(JSON).length - 1) {
            return;
        }

        const span = document.createElement('span');
        span.innerHTML = '·';
        molListElement.appendChild(span);
    });
}

class TableDataListener {
    static _instance = null;
    #table;
    #tableData;

    constructor(tableElement, tableData) {
        if (TableDataListener._instance) {
            return TableDataListener._instance;
        }

        TableDataListener._instance = this;
        this.#table = tableElement;
        this.#tableData = tableData;

        return this;
    }

    setFilter() {
        this.#table.innerHTML = this.#tableData.updateTableData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadTableFilter(document.querySelector('.molList'), MOL_DATA, MOL_TAG);
    loadTableFilter(document.querySelector('.addressList'), ADDRESS_DATA, ADDRESS_TAG);
    loadTableFilter(document.querySelector('.sorting'), SORT_DATA, SORT_TAG);

    // Генерация таблицы
    const table = document.querySelector('main .table');

    const tableData = new TableData(TABLE_JSON);
    new TableDataListener(table, tableData);

    table.innerHTML = tableData.generateTable();

    // Поиск
    const searchBarForm = document.querySelector('.header__searchbar');
    searchBarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        FILTER_DATA.search = e.target.elements.search.value;

        new TableDataListener().setFilter();
        return false; // чтобы не перезагружал страницу
    });

    // Очистка поиска при нажатии Esc
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Escape') {
            searchBarForm.elements.search.value = '';
            searchBarForm.submit();
        }
    });

    // Сортировка и фильтрация таблицы
    // const buttonShowWithoutFolder = document.getElementById('show_withoutFolders');
    // const buttonShowWithFolder = document.getElementById('show_withFolders');
    //
    // buttonShowWithoutFolder.addEventListener('click', () => {
    //     FILTER_DATA.isInFolder = false;
    //     table.innerHTML = tableData.updateTableData();
    // });
    //
    // buttonShowWithFolder.addEventListener('click', () => {
    //     FILTER_DATA.isInFolder = true;
    //     table.innerHTML = tableData.updateTableData();
    // });
});