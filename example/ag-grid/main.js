
(function (selector) {

    const columns = ['age class', '2020', '2030', '2040', '2050'];
    const index = ["総数", "~15", "16~64", "65~",];

    const columnDefs = columns.map(c => { return { field: c } });

    const defaultColDef = {
        sortable: true,
        filter: true,
        autoHeight: true,
        flex: 1,
        headerClass: ['mycell-common'],
        cellClass: ['mycell-common'],
        suppressMenu: true
    }

    // row headers style
    Object.assign(columnDefs[0], {
        headerName: '',
        lockPosition: true,
        pinned: 'left',
        lockPinned: true,
        cellStyle: {
            fontWeight: 'bold',

        }
    })



    const data = [
        [100, 95, 85, 80,],
        [15, 7, 4, 4,],
        [60, 61, 51, 54,],
        [25, 27, 30, 27]
    ];

    const rowData = data.map((arry, i) => {
        arry.splice(0, 0, index[i]);
        return arry.reduce(
            (acc, cur, i) => { acc[columns[i]] = cur; return acc }, {})
    })

    // let the grid know which columns and what data to use
    const gridOptions = {
        domLayout: "autoHeight",
        columnDefs,
        defaultColDef,
        rowSelection: 'multiple',
        rowData
    };

    const gridDiv = document.querySelector(selector);
    new agGrid.Grid(gridDiv, gridOptions);
    // gridOptions.columnApi.autoSizeAllColumns()

})('#grid2');

(function (selector) {
    const columnDefs = [
        { field: "make", checkboxSelection: true },
        { field: "model" },
        { field: "price" }
    ];

    const defaultColDef = {
        sortable: true,
        filter: true,
    }

    const rowData = [
        { make: "Toyota", model: "Celica", price: 35000 },
        { make: "Ford", model: "Mondeo", price: 32000 },
        { make: "Porsche", model: "Boxter", price: 72000 }
    ];

    // let the grid know which columns and what data to use
    const gridOptions = {
        columnDefs,
        defaultColDef,
        rowSelection: 'multiple',
        rowData
    };

    const gridDiv = document.querySelector(selector);
    new agGrid.Grid(gridDiv, gridOptions);

    window.getSelectedRows = () => {
        const selectedNodes = gridOptions.api.getSelectedNodes()
        const selectedData = selectedNodes.map(node => node.data)
        const selectedDataStringPresentation = selectedData.map(node => `${node.make} ${node.model}`).join(', ')
        alert(`Selected nodes: ${selectedDataStringPresentation}`);
    }
})('#myGrid');