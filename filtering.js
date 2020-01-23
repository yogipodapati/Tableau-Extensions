let unregisterHandlerFunctions = [];

var columnDefs = [];
var rowData = [];
var gridOptions;


// createAgGrid();
$(document).ready(function() {
    var searchString;
    initializeTableau(searchString);
    $("#search").click(function() {
        searchString = $("#search-box").val();
        initializeTableau(searchString);

    });
$("#sort").click(function() {
      var sortColumns = getSelectedCheckBixes();
      var sortTo = sortData(sortColumns);
      getSummaryData("", sortTo)
    });
});

function sortData(sortColumns){
var sorto = {}
sortColumns.forEach(sortColumn =>{
   sorto[sortColumn]= 'asc'
})
return sorto;
}

Array.prototype.keySort = function(keys) {

    keys = keys || {};
  
    var obLen = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };

    var obIx = function(obj, ix) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size == ix)
                    return key;
                size++;
            }
        }
        return false;
    };

    var keySort = function(a, b, d) {
        d = d !== null ? d : 1;
        if (a == b)
            return 0;
        return a > b ? 1 * d : -1 * d;
    };

    var KL = obLen(keys);

    if (!KL) return this.sort(keySort);

    for ( var k in keys) {
        // asc unless desc or skip
        keys[k] = 
                keys[k] == 'desc' || keys[k] == -1  ? -1 
              : (keys[k] == 'skip' || keys[k] === 0 ? 0 
              : 1);
    }

    this.sort(function(a, b) {
        var sorted = 0, ix = 0;

        while (sorted === 0 && ix < KL) {
            var k = obIx(keys, ix);
            if (k) {
                var dir = keys[k];
                sorted = keySort(a[k], b[k], dir);
                ix++;
            }
        }
        return sorted;
    });
    return this;
};

function initializeTableau(searchString) {
    tableau.extensions.initializeAsync().then(function() {
        //fetchFilters();
        //alert("initializing...")
        getSummaryData(searchString, null);
        $('#clear').click(clearAllFilters);
    }, function(err) {
        // Something went wrong in initialization.
        console.log('Error while Initializing: ' + err.toString());
    });

}

function getSelectedCheckBixes(){
  var columns = [];
            $.each($("input[name='header']:checked"), function(){
                columns.push($(this).val());
            });
            return columns;
}

/*function prepareCheckBoxes(headers){
  //var headers = ['a','b','c']
  //alert("preparing check bixes")
  //alert(JSON.stringify(headers))
  document.getElementById("checkbox-div").innerHTML='';
  headers.forEach(header =>{
    var checkboxDiv = document.getElementById("checkbox-div"); 
              
            // creating checkbox element 
            var checkbox = document.createElement('input'); 
              
            checkbox.type = "checkbox"; 
            checkbox.name = "header"; 
            checkbox.value = header; 

            checkbox.id = header; 
            var label = document.createElement('label'); 
              
            label.htmlFor = "id"; 
              
            label.appendChild(document.createTextNode(header)); 
              
            checkboxDiv.appendChild(checkbox); 
            checkboxDiv.appendChild(label); 
            checkboxDiv.classList.add( "col-md-2");
  });
}*/

function prepareCheckBoxes(headers) {
  //var headers = ["a", "b", "c"];
  headers.push("a");
  headers.push("b");
  headers.push("c");
  headers.push("d");
  headers.push("e");
  headers.push("a");
  headers.push("a");
  headers.push("a");
  var check_boxes = document.getElementById("check-boxes");
  document.getElementById("checkbox-div").innerHTML='';
  //  var check_boxes = $("#check-boxes").addClass("col-md-2");
  headers.forEach(header => {
    //check_boxes.classList.add("col-md-3");
var checkboxDiv = document.getElementById("checkbox-div");
    //checkboxDiv.classList.add("col-md-3");
    // creating checkbox element
    var divElement = document.createElement("checkboxWrap");
    divElement.classList.add("col-md-2");
    var checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.name = "header";
    checkbox.value = header;
    checkbox.id = header;
    // checkbox.classList.add("col-md-1");
    var label = document.createElement("label");

    label.htmlFor = header;
    //label.classList.add("col-md-1");

    label.appendChild(document.createTextNode(header));

    divElement.appendChild(checkbox);
    divElement.appendChild(label);
    checkboxDiv.appendChild(divElement);
    // check_boxes.appendChild(checkboxDiv);
  });
}

function prepareHeaders(objArr) {
    var header = "";
    objArr.forEach(function(obj) {
        header = header + obj['_fieldName'] + ',';
    });
    return header + "\r\n";
}


function prepareHeadersArr(objArr) {
    //alert(JSON.stringify(objArr))
    var headers = [];
    objArr.forEach(function(obj) {
        if(!headers.includes(obj['_fieldName']))
            headers.push(obj['_fieldName']);
    });
   // alert(JSON.stringify(headers))
    return headers;
}

function convertToCSV(objArray) {
    var str = '';
    objArray['_data'].forEach(d1 => {
        let line = '';
        d1.forEach(d2 => {
            if (line != '')
                line = line + ','
            line = line + d2['_formattedValue'];
        });
        str += line + '\r\n';

    });
    return str;
}


function convertToAgGridRow(objArray) {
    //{make: "Toyota", model: "Celica", price: 35000},
    var rows = [];
    // var line='';
    var headers = prepareHeadersArr(objArray['_columns'])
    prepareCheckBoxes(headers);
    
    //alert(JSON.stringify(headers))
    objArray['_data'].forEach(d1 => {
        // let line = '';
        count = 0;
        var row = {}
        d1.forEach(d2 => {
            // alert(d2['_formattedValue']);
            row[headers[count]] = d2['_formattedValue']
            count++;

        });
        // alert(JSON.stringify(row))
        rows.push(row)
        // str += line + '\r\n';

    });
    return rows;
}

function downloadExcel(obj) {
    var csv = convertToCSV(obj);
    var exportedFilenmae = "export.csv";
    var headers = prepareHeaders(obj['_columns']);
    csv = headers + csv;
    var blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

}

function fetchFilters() {
    // While performing async task, show loading message to user.
    $('#loading').addClass('show');

    // Whenever we restore the filters table, remove all save handling functions,
    // since we add them back later in this function.
    unregisterHandlerFunctions.forEach(function(unregisterHandlerFunction) {
        unregisterHandlerFunction();
    });

    let filterFetchPromises = [];

    // List of all filters in a dashboard.
    let dashboardfilters = [];

    // To get filter info, first get the dashboard.
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Then loop through each worksheet and get its filters, save promise for later.
    dashboard.worksheets.forEach(function(worksheet) {
        //    alert(worksheet.name);
        options = {
            maxRows: 0,
            ignoreAliases: true,
            ignoreSelection: true,
            includeAllColumns: false
        };
        worksheet.getSummaryDataAsync(options).then(function(t) {
            if (worksheet.name === 'AAA') {
                var data = t;
                // alert(JSON.stringify(data));
                // alert(JSON.stringify(data['_columns']));
                downloadExcel(data);
            }
        });
        filterFetchPromises.push(worksheet.getFiltersAsync());
        let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
        unregisterHandlerFunctions.push(unregisterHandlerFunction);
    });

    // Now, we call every filter fetch promise, and wait for all the results
    // to finish before displaying the results to the user.
    Promise.all(filterFetchPromises).then(function(fetchResults) {
        fetchResults.forEach(function(filtersForWorksheet) {
            filtersForWorksheet.forEach(function(filter) {
                dashboardfilters.push(filter);
            });
        });

        buildFiltersTable(dashboardfilters);
    });
}

// This is a handling function that is called anytime a filter is changed in Tableau.
function filterChangedHandler(filterEvent) {
    // Just reconstruct the filters table whenever a filter changes.
    // This could be optimized to add/remove only the different filters.
    //$("#myGrid").remove();
    fetchFilters();
    getSummaryData();
}

function createAgGrid(data, searchString, sortTo) {
    colHeaders = prepareHeadersArr(data['_columns'])
    convertToAgGridRow(data)
    columnDefs = [];
    colHeaders.forEach(col => {
        //alert(col)
        columnDefs.push({
            headerName: col,
            field: col,
            sortable: true,
            resizable: true,
            filter: true, 
            //headerComponentParams: {menuIcon: 'fas fa-sort'}
        })
    });


    // specify the data
    rowData = convertToAgGridRow(data)
    if(sortTo){

rowData.keySort(sortTo);

                }
    filteredRowData = [];
    if (searchString) {
        for (i = 0; i < rowData.length; i++) {
            for (var x in rowData[i]) {

                if (rowData[i][x].toLowerCase().includes(searchString)) {
                    filteredRowData.push(rowData[i])
                }
            }
        }
        rowData = filteredRowData;
    }

    // let the grid know which columns and what data to use
    gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        components: {
       agColumnHeader: CustomHeader
    },
    defaultColDef: {
       // width: 100,
        headerComponentParams: {
            menuIcon: 'fa-bars'
        },
        sortable: true,
        resizable: true,
        filter: true
    }
    };
    var gridDiv = document.querySelector('#myGrid');
    gridDiv.innerHTML = '';
    new agGrid.Grid(gridDiv, gridOptions);

}


function getSummaryData(searchString, sortTo) {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    //alert(dashboard)
    // Then loop through each worksheet and get its filters, save promise for later.
    dashboard.worksheets.forEach(function(worksheet) {
        //    alert(worksheet.name);
        options = {
            maxRows: 0,
            ignoreAliases: true,
            ignoreSelection: true,
            includeAllColumns: false
        };
        worksheet.getSummaryDataAsync(options).then(function(t) {
            if (worksheet.name === 'AAA') {
                
                    createAgGrid(t, searchString, sortTo);
                
                
                // alert(JSON.stringify(data));
                // alert(JSON.stringify(data['_columns']));
                // downloadExcel(data);

            }
        });
    });
}

