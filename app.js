const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

const totalProducts = document.getElementById("totalProducts");
const totalStock = document.getElementById("totalStock");
const lowStock = document.getElementById("lowStock");
const outOfStock = document.getElementById("outOfStock");

const totalSales = document.getElementById("totalSales");
const inventoryValue = document.getElementById("inventoryValue");
const lowStockPercent = document.getElementById("lowStockPercent");

const inventoryTable = document.getElementById("inventoryTable");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

let inventoryData = [];
let activeFilter = "all";


// =========================
// CSV UPLOAD
// =========================

fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {
        fileName.textContent = "No file selected";
        return;
    }

    fileName.textContent = "Selected file: " + file.name;

    const reader = new FileReader();

    reader.onload = function (event) {

        const csvText = event.target.result;

        inventoryData = parseCSV(csvText);

        if (inventoryData.length === 0) {
            alert("Invalid or empty CSV file. Please use the StockGuard template.");
            return;
        }

        const requiredColumns = [
            "SKU",
            "Product Name",
            "Stock",
            "Min Stock"
        ];

        const firstRow = inventoryData[0];

        const missingColumns = requiredColumns.filter(
            column => !(column in firstRow)
        );

        if (missingColumns.length > 0) {

            alert(
                "Missing columns: " +
                missingColumns.join(", ") +
                "\n\nPlease use the StockGuard CSV template."
            );

            inventoryData = [];
            return;
        }

        updateDashboard();
        applyFiltersAndSort();
    };

    reader.readAsText(file);
});


// =========================
// CSV PARSER
// =========================

function parseCSV(csvText) {

    const lines = csvText
        .trim()
        .split("\n");

    if (lines.length < 2) {
        return [];
    }

    const headers = lines[0]
        .split(",")
        .map(header => header.trim());

    const data = [];

    for (let i = 1; i < lines.length; i++) {

        const values = lines[i]
            .split(",")
            .map(value => value.trim());

        if (values.length < headers.length) {
            continue;
        }

        const product = {};

        headers.forEach((header, index) => {
            product[header] = values[index];
        });

        data.push(product);
    }

    return data;
}


// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    const total = inventoryData.length;

    let stock = 0;
    let low = 0;
    let out = 0;
    let sales = 0;
    let value = 0;

    inventoryData.forEach(product => {

        const currentStock = Number(product["Stock"]) || 0;
        const minimumStock = Number(product["Min Stock"]) || 0;

        const unitsSold = Number(product["Units Sold"]) || 0;
        const price = Number(product["Price"]) || 0;

        stock += currentStock;

        sales += unitsSold * price;
        value += currentStock * price;

        if (currentStock === 0) {
            out++;
        }
        else if (currentStock <= minimumStock) {
            low++;
        }

    });

    totalProducts.textContent = total;
    totalStock.textContent = stock;
    lowStock.textContent = low;
    outOfStock.textContent = out;

    const lowPercent = total > 0 ? (low / total) * 100 : 0;

    totalSales.textContent =
        "₹" + sales.toLocaleString("en-IN");

    inventoryValue.textContent =
        "₹" + value.toLocaleString("en-IN");

    lowStockPercent.textContent =
        lowPercent.toFixed(1) + "%";
}


// =========================
// DISPLAY INVENTORY
// =========================

function displayInventory(data) {

    inventoryTable.innerHTML = "";

    data.forEach(product => {

        const stock = Number(product["Stock"]) || 0;
        const minimumStock = Number(product["Min Stock"]) || 0;

        let status = "";
        let statusClass = "";

        if (stock === 0) {

            status = "Out of Stock";
            statusClass = "status-out";

        }
        else if (stock <= minimumStock) {

            status = "Low Stock";
            statusClass = "status-low";

        }
        else {

            status = "In Stock";
            statusClass = "status-in";
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product["SKU"] || ""}</td>

            <td>${product["Product Name"] || ""}</td>

            <td>${stock}</td>

            <td>${minimumStock}</td>

            <td>
                <span class="status-badge ${statusClass}">
                    ${status}
                </span>
            </td>
        `;

        inventoryTable.appendChild(row);
    });
}


// =========================
// SEARCH
// =========================

searchInput.addEventListener("input", function () {

    applyFiltersAndSort();

});


// =========================
// FILTER BUTTONS
// =========================

function filterInventory(type) {

    activeFilter = type;

    applyFiltersAndSort();

}


// =========================
// SEARCH + FILTER + SORT
// =========================

function applyFiltersAndSort() {

    let result = [...inventoryData];


    // SEARCH

    const searchValue =
        searchInput.value.toLowerCase().trim();

    if (searchValue !== "") {

        result = result.filter(product => {

            const sku =
                (product["SKU"] || "").toLowerCase();

            const productName =
                (product["Product Name"] || "").toLowerCase();

            return (
                sku.includes(searchValue) ||
                productName.includes(searchValue)
            );

        });
    }


    // FILTER

    if (activeFilter === "in") {

        result = result.filter(product => {

            const stock =
                Number(product["Stock"]) || 0;

            const minimumStock =
                Number(product["Min Stock"]) || 0;

            return stock > minimumStock;

        });

    }


    else if (activeFilter === "low") {

        result = result.filter(product => {

            const stock =
                Number(product["Stock"]) || 0;

            const minimumStock =
                Number(product["Min Stock"]) || 0;

            return (
                stock > 0 &&
                stock <= minimumStock
            );

        });

    }


    else if (activeFilter === "out") {

        result = result.filter(product => {

            const stock =
                Number(product["Stock"]) || 0;

            return stock === 0;

        });

    }


    // SORT

    if (sortSelect.value === "low-high") {

        result.sort((a, b) => {

            return (
                (Number(a["Stock"]) || 0) -
                (Number(b["Stock"]) || 0)
            );

        });

    }


    else if (sortSelect.value === "high-low") {

        result.sort((a, b) => {

            return (
                (Number(b["Stock"]) || 0) -
                (Number(a["Stock"]) || 0)
            );

        });

    }


    displayInventory(result);
}


// =========================
// SORT DROPDOWN
// =========================

sortSelect.addEventListener("change", function () {

    applyFiltersAndSort();

});


// =========================
// DOWNLOAD REPORT
// =========================

function downloadReport() {

    if (inventoryData.length === 0) {

        alert(
            "Please upload an inventory CSV file first."
        );

        return;
    }

    let csv =
        "SKU,Product Name,Stock,Min Stock,Status\n";


    inventoryData.forEach(product => {

        const stock =
            Number(product["Stock"]) || 0;

        const minimumStock =
            Number(product["Min Stock"]) || 0;

        let status = "";


        if (stock === 0) {

            status = "Out of Stock";

        }
        else if (stock <= minimumStock) {

            status = "Low Stock";

        }
        else {

            status = "In Stock";
        }


        csv +=
            `"${product["SKU"] || ""}",` +
            `"${product["Product Name"] || ""}",` +
            `${stock},` +
            `${minimumStock},` +
            `"${status}"\n`;

    });


    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "StockGuard_Inventory_Report.csv";


    link.click();


    URL.revokeObjectURL(url);
}


// =========================
// DOWNLOAD TEMPLATE
// =========================

function downloadTemplate() {

    const template =
        "SKU,Product Name,Stock,Min Stock,Units Sold,Price\n" +
        "A001,Chair,20,5,25,1999\n" +
        "A002,Table,10,5,12,3999\n" +
        "A003,Lamp,5,5,31,999";


    const blob = new Blob(
        [template],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "StockGuard_Inventory_Template.csv";


    link.click();


    URL.revokeObjectURL(url);
}


// =========================
// RESET VIEW
// =========================

function resetView() {

    searchInput.value = "";

    sortSelect.value = "default";

    activeFilter = "all";

    applyFiltersAndSort();
}