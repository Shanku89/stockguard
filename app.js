/* =========================================
   STOCKGUARD - FINAL APP.JS
========================================= */

let inventoryData = [];
let currentFilter = "all";


/* =========================================
   SAMPLE DATA
========================================= */

const sampleData = [
    {
        sku: "A1HC001",
        name: "Premium Table",
        stock: 85,
        minStock: 20,
        sales: 12500,
        price: 2500
    },
    {
        sku: "A1HC002",
        name: "Wooden Chair",
        stock: 12,
        minStock: 20,
        sales: 6800,
        price: 1200
    },
    {
        sku: "A1HC003",
        name: "Office Desk",
        stock: 0,
        minStock: 10,
        sales: 9200,
        price: 4500
    },
    {
        sku: "A1HC004",
        name: "Storage Cabinet",
        stock: 45,
        minStock: 15,
        sales: 7500,
        price: 3200
    },
    {
        sku: "A1HC005",
        name: "Side Table",
        stock: 8,
        minStock: 15,
        sales: 4100,
        price: 1800
    }
];


/* =========================================
   START
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    inventoryData = [...sampleData];

    updateDashboard();
    renderTable();
    setupSearch();
    setupSorting();
    setupFileUpload();

});


/* =========================================
   FILE UPLOAD
========================================= */

function setupFileUpload() {

    const fileInput =
        document.getElementById("fileInput");

    if (!fileInput) return;

    fileInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];

            if (!file) return;

            const fileName =
                document.getElementById("fileName");

            if (fileName) {
                fileName.textContent =
                    "Selected: " + file.name;
            }

            const reader =
                new FileReader();

            reader.onload = function (e) {

                parseCSV(e.target.result);

            };

            reader.readAsText(file);

        }
    );

}


/* =========================================
   CSV
========================================= */

function parseCSV(text) {

    const lines =
        text.trim().split(/\r?\n/);

    if (lines.length < 2) {

        alert("CSV file does not contain enough data.");

        return;
    }

    const headers =
        lines[0]
            .split(",")
            .map(h => h.trim().toLowerCase());

    const rows = [];

    for (let i = 1; i < lines.length; i++) {

        if (!lines[i].trim()) continue;

        const values =
            lines[i]
                .split(",")
                .map(v => v.trim());

        const row = {};

        headers.forEach(
            (header, index) => {
                row[header] =
                    values[index] || "";
            }
        );

        rows.push({

            sku:
                row.sku ||
                row["sku id"] ||
                row["product sku"] ||
                "",

            name:
                row.name ||
                row["product name"] ||
                row.product ||
                "",

            stock:
                Number(
                    row.stock ||
                    row.quantity ||
                    row.inventory ||
                    0
                ),

            minStock:
                Number(
                    row["min stock"] ||
                    row.minstock ||
                    row.minimum ||
                    10
                ),

            sales:
                Number(
                    row.sales ||
                    row["total sales"] ||
                    0
                ),

            price:
                Number(
                    row.price ||
                    row["unit price"] ||
                    0
                )

        });

    }

    inventoryData = rows;

    currentFilter = "all";

    updateDashboard();
    renderTable();

}


/* =========================================
   STATUS
========================================= */

function getStatus(item) {

    if (item.stock <= 0) {
        return "out";
    }

    if (item.stock <= item.minStock) {
        return "low";
    }

    return "in";
}


function getStatusText(status) {

    if (status === "out") {
        return "Out of Stock";
    }

    if (status === "low") {
        return "Low Stock";
    }

    return "In Stock";
}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const totalProducts =
        inventoryData.length;

    const totalStock =
        inventoryData.reduce(
            (sum, item) =>
                sum + item.stock,
            0
        );

    const lowStock =
        inventoryData.filter(
            item =>
                getStatus(item) === "low"
        ).length;

    const outOfStock =
        inventoryData.filter(
            item =>
                getStatus(item) === "out"
        ).length;

    const inStock =
        inventoryData.filter(
            item =>
                getStatus(item) === "in"
        ).length;

    const totalSales =
        inventoryData.reduce(
            (sum, item) =>
                sum + item.sales,
            0
        );

    const inventoryValue =
        inventoryData.reduce(
            (sum, item) =>
                sum +
                item.stock *
                item.price,
            0
        );


    setText(
        "totalProducts",
        totalProducts
    );

    setText(
        "totalStock",
        totalStock
    );

    setText(
        "lowStock",
        lowStock
    );

    setText(
        "outOfStock",
        outOfStock
    );

    setText(
        "totalSales",
        formatCurrency(totalSales)
    );

    setText(
        "inventoryValue",
        formatCurrency(inventoryValue)
    );


    const lowPercent =
        totalProducts
            ? Math.round(
                lowStock /
                totalProducts *
                100
            )
            : 0;

    setText(
        "lowStockPercent",
        lowPercent + "% of products"
    );


    /* SUMMARY */

    setText(
        "summaryInStock",
        inStock
    );

    setText(
        "summaryLowStock",
        lowStock
    );

    setText(
        "summaryOutStock",
        outOfStock
    );

    setText(
        "summaryTotalProducts",
        totalProducts
    );


    /* HEALTH */

    const healthy =
        inStock;

    const attention =
        lowStock;

    const critical =
        outOfStock;


    const healthyPercent =
        totalProducts
            ? Math.round(
                healthy /
                totalProducts *
                100
            )
            : 0;

    const attentionPercent =
        totalProducts
            ? Math.round(
                attention /
                totalProducts *
                100
            )
            : 0;

    const criticalPercent =
        totalProducts
            ? Math.round(
                critical /
                totalProducts *
                100
            )
            : 0;


    setText(
        "healthyCount",
        healthy
    );

    setText(
        "attentionCount",
        attention
    );

    setText(
        "criticalCount",
        critical
    );


    setText(
        "healthyPercent",
        healthyPercent + "%"
    );

    setText(
        "attentionPercent",
        attentionPercent + "%"
    );

    setText(
        "criticalPercent",
        criticalPercent + "%"
    );


    setWidth(
        "healthyBar",
        healthyPercent
    );

    setWidth(
        "attentionBar",
        attentionPercent
    );

    setWidth(
        "criticalBar",
        criticalPercent
    );


    /* ANALYTICS */

    setText(
        "chartTotalStock",
        totalStock
    );

    setText(
        "chartLowStock",
        lowStock
    );

    setText(
        "chartOutStock",
        outOfStock
    );


    const maxValue =
        Math.max(
            totalStock,
            lowStock,
            outOfStock,
            1
        );


    setWidth(
        "chartStockBar",
        totalStock /
        maxValue *
        100
    );

    setWidth(
        "chartLowBar",
        lowStock /
        maxValue *
        100
    );

    setWidth(
        "chartOutBar",
        outOfStock /
        maxValue *
        100
    );


    setText(
        "analyticsHealthy",
        healthy
    );

    setText(
        "analyticsAttention",
        attention
    );

    setText(
        "analyticsCritical",
        critical
    );


    updateRestock();

}


/* =========================================
   TABLE
========================================= */

function renderTable(
    data = inventoryData
) {

    const table =
        document.getElementById(
            "inventoryTable"
        );

    if (!table) return;

    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px;">
                    No inventory data found.
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(item => {

        const status =
            getStatus(item);

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(item.sku)}
                </strong>
            </td>

            <td>
                ${escapeHTML(item.name)}
            </td>

            <td>
                ${item.stock}
            </td>

            <td>
                ${item.minStock}
            </td>

            <td>
                <span
                    class="status-badge status-${status}"
                >
                    ${getStatusText(status)}
                </span>
            </td>

            <td>
                <button
                    class="action-btn"
                    onclick="viewProduct('${escapeHTML(item.sku)}')"
                >
                    View
                </button>
            </td>

        `;

        table.appendChild(row);

    });

}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;

    input.addEventListener(
        "input",
        applyFilters
    );

}


function applyFilters() {

    const input =
        document.getElementById(
            "searchInput"
        );

    const search =
        input
            ? input.value
                .toLowerCase()
                .trim()
            : "";


    let filtered =
        [...inventoryData];


    if (currentFilter !== "all") {

        filtered =
            filtered.filter(item => {

                const status =
                    getStatus(item);

                return (
                    status ===
                    currentFilter
                );

            });

    }


    if (search) {

        filtered =
            filtered.filter(item =>

                item.sku
                    .toLowerCase()
                    .includes(search)

                ||

                item.name
                    .toLowerCase()
                    .includes(search)

            );

    }


    const sort =
        document.getElementById(
            "sortSelect"
        );


    if (sort) {

        if (
            sort.value ===
            "low-high"
        ) {

            filtered.sort(
                (a, b) =>
                    a.stock -
                    b.stock
            );

        }

        if (
            sort.value ===
            "high-low"
        ) {

            filtered.sort(
                (a, b) =>
                    b.stock -
                    a.stock
            );

        }

    }


    renderTable(filtered);

}


/* =========================================
   FILTER
========================================= */

function filterInventory(filter) {

    currentFilter = filter;

    applyFilters();

}


/* =========================================
   SORT
========================================= */

function setupSorting() {

    const sort =
        document.getElementById(
            "sortSelect"
        );

    if (!sort) return;

    sort.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================
   RESET
========================================= */

function resetView() {

    currentFilter = "all";


    const search =
        document.getElementById(
            "searchInput"
        );

    if (search) {
        search.value = "";
    }


    const sort =
        document.getElementById(
            "sortSelect"
        );

    if (sort) {
        sort.value = "default";
    }


    renderTable();

}


/* =========================================
   RESTOCK
========================================= */

function updateRestock() {

    const items =
        inventoryData.filter(
            item =>
                getStatus(item) === "low"
                ||
                getStatus(item) === "out"
        );


    setText(
        "restockCount",
        items.length +
        " Products"
    );


    const list =
        document.getElementById(
            "restockList"
        );

    if (!list) return;

    list.innerHTML = "";


    if (!items.length) {

        list.innerHTML = `
            <p class="no-restock">
                No products need restocking.
            </p>
        `;

        return;
    }


    items.forEach(item => {

        const required =
            Math.max(
                item.minStock -
                item.stock,
                0
            );


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "restock-item";


        div.innerHTML = `

            <strong>
                ${escapeHTML(item.name)}
            </strong>

            <span>
                SKU: ${escapeHTML(item.sku)}
            </span>

            <span>
                Current Stock: ${item.stock}
            </span>

            <span class="restock-quantity">
                Restock: ${required}
            </span>

        `;


        list.appendChild(div);

    });

}


/* =========================================
   VIEW
========================================= */

function viewProduct(sku) {

    const item =
        inventoryData.find(
            product =>
                product.sku === sku
        );


    if (!item) return;


    alert(
        "Product: " +
        item.name +
        "\n\n" +

        "SKU: " +
        item.sku +
        "\n" +

        "Stock: " +
        item.stock +
        "\n" +

        "Minimum Stock: " +
        item.minStock +
        "\n" +

        "Status: " +
        getStatusText(
            getStatus(item)
        )
    );

}


/* =========================================
   CLEAR
========================================= */

function clearInventory() {

    if (
        !confirm(
            "Are you sure you want to clear the inventory?"
        )
    ) {
        return;
    }


    inventoryData = [];

    updateDashboard();

    renderTable();


    const fileName =
        document.getElementById(
            "fileName"
        );

    if (fileName) {

        fileName.textContent =
            "No file selected";

    }

}


/* =========================================
   TEMPLATE
========================================= */

function downloadTemplate() {

    const csv =
        "SKU,Product Name,Stock,Min Stock,Sales,Price\n" +
        "A1HC001,Premium Table,50,20,10000,2500\n" +
        "A1HC002,Wooden Chair,15,20,5000,1200\n" +
        "A1HC003,Office Desk,0,10,7500,4500\n";


    downloadFile(
        csv,
        "stockguard_inventory_template.csv"
    );

}


/* =========================================
   REPORT
========================================= */

function downloadReport() {

    let csv =
        "SKU,Product Name,Stock,Min Stock,Status,Sales,Price\n";


    inventoryData.forEach(item => {

        csv +=
            `"${item.sku}",` +
            `"${item.name}",` +
            `${item.stock},` +
            `${item.minStock},` +
            `"${getStatusText(
                getStatus(item)
            )}",` +
            `${item.sales},` +
            `${item.price}\n`;

    });


    downloadFile(
        csv,
        "stockguard_inventory_report.csv"
    );

}


/* =========================================
   DOWNLOAD
========================================= */

function downloadFile(
    content,
    filename
) {

    const blob =
        new Blob(
            [content],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


/* =========================================
   HELPERS
========================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function setWidth(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) return;


    const safe =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    element.style.width =
        safe + "%";

}


function formatCurrency(value) {

    return "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN"
            );

}


function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            character => {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return entities[
                    character
                ];

            }
        );

}
